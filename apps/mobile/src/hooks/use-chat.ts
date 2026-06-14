import { useState, useEffect, useCallback } from 'react';
import { aiService } from '../services/ai-service';
import { ChatMessageResponse, ConversationResponse } from '../../../../shared/contracts';
import Toast from 'react-native-toast-message';

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

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setSending(true);

    try {
      const response = await aiService.sendChat(text, currentConversationId || undefined);
      
      // Update active ID if this was a new conversation
      if (!currentConversationId) {
        setCurrentConversationId(response.conversationId);
        loadConversations();
      }

      setMessages((prev) => [...prev, response.message]);
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Send Failed',
        text2: 'Could not communicate with AI Coach.',
      });
    } finally {
      setSending(false);
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
