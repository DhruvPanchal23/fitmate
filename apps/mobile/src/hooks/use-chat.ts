import { useState, useEffect, useCallback } from 'react';
import { aiService } from '../services/ai-service';
import { ChatMessageResponse, ConversationResponse } from '../../../../shared/contracts';
import Toast from 'react-native-toast-message';
import { CONFIG } from '../config';
import { tokenStorage } from '../services/token-storage';

export function useChat() {
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Load list of all conversations
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const list = await aiService.getConversations();
      setConversations(list);
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Load Failed',
        text2: 'Could not fetch your chat history.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Load messages for a specific conversation
  const loadConversation = useCallback(async (convoId: string) => {
    try {
      setLoading(true);
      const details = await aiService.getConversation(convoId);
      setCurrentConversationId(details.id);
      setMessages(details.messages);
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Load Failed',
        text2: 'Could not fetch this conversation.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Load default prompt suggestions
  const loadSuggestions = useCallback(async () => {
    try {
      const data = await aiService.getSuggestions();
      setSuggestions(data.suggestions);
    } catch (e) {
      // Fallback suggestions
      setSuggestions([
        'What should I eat after leg day?',
        'How can I increase my protein today?',
        'Suggest a vegetarian breakfast.',
      ]);
    }
  }, []);

  useEffect(() => {
    loadConversations();
    loadSuggestions();
  }, [loadConversations, loadSuggestions]);

  // Start a new blank conversation
  const startNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  // Send a message
  const sendMessage = async (text: string) => {
    if (!text.trim() || sending) return;

    // Optimistic User Message
    const userMsg: ChatMessageResponse = {
      id: 'user-temp-' + Date.now(),
      role: 'user',
      content: text,
      createdAt: new Date(),
    };

    // Placeholder Assistant Message for progressive streaming
    const assistantMsg: ChatMessageResponse = {
      id: 'assistant-temp-' + Date.now(),
      role: 'assistant',
      content: '',
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInputText('');
    setSending(true);

    try {
      const token = await tokenStorage.getToken();
      const url = `${CONFIG.API_BASE_URL}/ai/chat/stream?message=${encodeURIComponent(text)}${currentConversationId ? `&conversationId=${currentConversationId}` : ''}`;
      
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      let lastLength = 0;
      let resolvedConvoId = currentConversationId;

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 3 || xhr.readyState === 4) {
          const raw = xhr.responseText;
          const updates = raw.substring(lastLength);
          lastLength = raw.length;

          // Parse SSE lines
          const lines = updates.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(line.substring(6));
                const tokenVal = parsed.token || '';
                
                if (parsed.conversationId && !resolvedConvoId) {
                  resolvedConvoId = parsed.conversationId;
                  setCurrentConversationId(parsed.conversationId);
                }

                if (tokenVal) {
                  setMessages((prev) => {
                    const copy = [...prev];
                    const last = copy[copy.length - 1];
                    if (last && last.role === 'assistant') {
                      last.content = last.content + tokenVal;
                    }
                    return copy;
                  });
                }
              } catch (e) {
                // ignore syntax error for partial lines
              }
            }
          }
        }

        if (xhr.readyState === 4) {
          setSending(false);
          loadConversations();
          
          if (resolvedConvoId) {
            loadConversation(resolvedConvoId);
          } else {
            // reload list fallback
            aiService.getConversations().then((list) => {
              setConversations(list);
              if (list.length > 0) {
                loadConversation(list[0].id);
              }
            }).catch(() => {});
          }
        }
      };

      xhr.onerror = () => {
        setSending(false);
        Toast.show({
          type: 'error',
          text1: 'Stream Failed',
          text2: 'Connection to streaming server failed.',
        });
      };

      xhr.send();
    } catch (e: any) {
      setSending(false);
      Toast.show({
        type: 'error',
        text1: 'Send Failed',
        text2: e.message || 'Could not communicate with AI Coach.',
      });
    }
  };

  // Regenerate last response
  const regenerateLast = async () => {
    if (!currentConversationId || sending) return;

    setSending(true);
    try {
      const response = await aiService.regenerateChat(currentConversationId);
      
      // Replace last message with the regenerated one
      setMessages((prev) => {
        const filtered = prev.filter((_, idx) => idx !== prev.length - 1);
        return [...filtered, response.message];
      });

      Toast.show({
        type: 'success',
        text1: 'Regenerated',
        text2: 'AI Coach updated response.',
      });
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Regeneration Failed',
        text2: 'Could not regenerate last response.',
      });
    } finally {
      setSending(false);
    }
  };

  // Delete conversation
  const deleteConversation = async (convoId: string) => {
    try {
      await aiService.deleteConversation(convoId);
      Toast.show({
        type: 'success',
        text1: 'Conversation Deleted',
      });
      
      if (currentConversationId === convoId) {
        startNewConversation();
      }
      loadConversations();
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Delete Failed',
        text2: 'Could not delete conversation.',
      });
    }
  };

  // Update conversation title
  const renameConversation = async (convoId: string, title: string) => {
    try {
      await aiService.updateTitle(convoId, title);
      loadConversations();
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Rename Failed',
      });
    }
  };

  // Submit response feedback rating
  const submitRating = async (messageId: string, rating: number, comment?: string) => {
    try {
      await aiService.submitFeedback({ messageId, rating, comment });
      Toast.show({
        type: 'success',
        text1: 'Feedback Submitted',
        text2: 'Thank you for helping us improve!',
      });
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Feedback Failed',
      });
    }
  };

  return {
    conversations,
    currentConversationId,
    messages,
    suggestions,
    inputText,
    setInputText,
    loading,
    sending,
    sendMessage,
    startNewConversation,
    selectConversation: loadConversation,
    deleteConversation,
    renameConversation,
    regenerateLast,
    submitRating,
  };
}

export default useChat;
