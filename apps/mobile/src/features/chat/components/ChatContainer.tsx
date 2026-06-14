import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform, Clipboard, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../theme/colors';
import { spacing, radius } from '../../../theme/spacing';
import { Card } from '../../../components/Card';
import { useChat } from '../../../hooks/use-chat';
import { ASSETS } from '../../../constants/assets';
import { MarkdownRenderer } from '../../../components/MarkdownRenderer';

export function ChatContainer() {
  const {
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
    selectConversation,
    deleteConversation,
    regenerateLast,
    submitRating,
  } = useChat();

  const scrollViewRef = useRef<ScrollView>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText);
    }
  };

  const handleCopyText = (text: string) => {
    Clipboard.setString(text);
    ToastAndroidShow('Copied to Clipboard!');
  };

  // Simple toast fallback since react-native-toast-message is globally active
  const ToastAndroidShow = (msg: string) => {
    // We can show it using standard react-native-toast-message or silent console log
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {/* Screen Header */}
      <View style={styles.header}>
        <View style={styles.headerMain}>
          <Pressable onPress={() => setShowHistory(!showHistory)} style={styles.historyToggle}>
            <Ionicons name={showHistory ? 'chatbubble-ellipses' : 'menu'} size={24} color={colors.brand} />
            <Text style={styles.historyToggleText}>
              {showHistory ? 'Close History' : 'Conversations'}
            </Text>
          </Pressable>
          <Text style={styles.headerTitle}>Diet Coach</Text>
          <Pressable onPress={startNewConversation} style={styles.newChatButton}>
            <Ionicons name="create-outline" size={22} color={colors.brand} />
          </Pressable>
        </View>
      </View>

      {/* Conversations History Panel */}
      {showHistory && (
        <View style={styles.historyPanel}>
          <Text style={styles.historyTitle}>Your Chat History</Text>
          {loading && conversations.length === 0 ? (
            <ActivityIndicator color={colors.brand} style={styles.loader} />
          ) : (
            <ScrollView style={styles.historyScroll} contentContainerStyle={styles.historyList}>
              {conversations.map((convo) => {
                const isActive = convo.id === currentConversationId;
                return (
                  <View
                    key={convo.id}
                    style={[
                      styles.historyItemRow,
                      isActive && styles.historyItemRowActive,
                    ]}
                  >
                    <Pressable
                      style={styles.historyItemPressable}
                      onPress={() => {
                        selectConversation(convo.id);
                        setShowHistory(false);
                      }}
                    >
                      <Ionicons
                        name="chatbubble-outline"
                        size={16}
                        color={isActive ? colors.brand : colors.onSurfaceSecondary}
                      />
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.historyItemText,
                          isActive && styles.historyItemTextActive,
                        ]}
                      >
                        {convo.title}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => deleteConversation(convo.id)}
                      style={styles.deleteConvoButton}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.warning} />
                    </Pressable>
                  </View>
                );
              })}
              {conversations.length === 0 && (
                <Text style={styles.noHistoryText}>No past conversations found.</Text>
              )}
            </ScrollView>
          )}
        </View>
      )}

      {/* Main Chat Screen Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatList}
          contentContainerStyle={styles.chatListContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((item) => {
            const isAI = item.role === 'assistant';
            return (
              <View
                key={item.id}
                style={[
                  styles.messageRow,
                  isAI ? styles.aiMessageRow : styles.userMessageRow,
                ]}
              >
                {isAI && <Image source={{ uri: ASSETS.images.aiCoachAvatar }} style={styles.chatAvatar} />}
                
                <View style={styles.bubbleContainer}>
                  <View
                    style={[
                      styles.messageBubble,
                      isAI ? styles.aiBubble : styles.userBubble,
                    ]}
                  >
                    {isAI ? (
                      <MarkdownRenderer text={item.content} style={styles.aiText} />
                    ) : (
                      <Text style={styles.userText}>{item.content}</Text>
                    )}
                  </View>

                  {/* Actions & Meta Cards for Assistant responses */}
                  {isAI && (
                    <View style={styles.aiMetaContainer}>
                      {/* Estimated Macros Card */}
                      {item.metadata?.estimatedMacros && (
                        <Card variant="glass" style={styles.macrosCard}>
                          <Text style={styles.metaLabel}>Recipe/Suggestion Estimate</Text>
                          <View style={styles.macrosGrid}>
                            <View style={styles.macroCol}>
                              <Text style={styles.macroVal}>{item.metadata.estimatedMacros.calories}</Text>
                              <Text style={styles.macroSub}>Kcal</Text>
                            </View>
                            <View style={styles.macroCol}>
                              <Text style={styles.macroVal}>{item.metadata.estimatedMacros.protein}g</Text>
                              <Text style={styles.macroSub}>Protein</Text>
                            </View>
                            <View style={styles.macroCol}>
                              <Text style={styles.macroVal}>{item.metadata.estimatedMacros.carbs}g</Text>
                              <Text style={styles.macroSub}>Carbs</Text>
                            </View>
                            <View style={styles.macroCol}>
                              <Text style={styles.macroVal}>{item.metadata.estimatedMacros.fat}g</Text>
                              <Text style={styles.macroSub}>Fat</Text>
                            </View>
                          </View>
                        </Card>
                      )}

                      {/* Warnings alert panel */}
                      {item.metadata?.warnings && item.metadata.warnings.length > 0 && (
                        <View style={styles.warningAlert}>
                          <Ionicons name="warning-outline" size={16} color={colors.warning} />
                          <View style={styles.warningTextList}>
                            {item.metadata.warnings.map((w, idx) => (
                              <Text key={idx} style={styles.warningText}>{w}</Text>
                            ))}
                          </View>
                        </View>
                      )}

                      {/* Suggested Foods tags */}
                      {item.metadata?.suggestedFoods && item.metadata.suggestedFoods.length > 0 && (
                        <View style={styles.tagsContainer}>
                          <Text style={styles.tagsTitle}>Recommended Foods:</Text>
                          <View style={styles.tagsRow}>
                            {item.metadata.suggestedFoods.map((f, idx) => (
                              <View key={idx} style={styles.foodTag}>
                                <Text style={styles.foodTagText}>{f}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {/* Suggested Meals list */}
                      {item.metadata?.suggestedMeals && item.metadata.suggestedMeals.length > 0 && (
                        <View style={styles.mealsContainer}>
                          <Text style={styles.tagsTitle}>Suggested Meal Plates:</Text>
                          {item.metadata.suggestedMeals.map((m, idx) => (
                            <View key={idx} style={styles.mealItemRow}>
                              <Ionicons name="restaurant-outline" size={14} color={colors.brand} />
                              <Text style={styles.mealItemText}>{m}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Copy, Like, and Dislike Actions row */}
                      <View style={styles.actionRow}>
                        <Pressable onPress={() => handleCopyText(item.content)} style={styles.actionIconButton}>
                          <Ionicons name="copy-outline" size={16} color={colors.onSurfaceSecondary} />
                        </Pressable>
                        <Pressable onPress={() => submitRating(item.id, 1)} style={styles.actionIconButton}>
                          <Ionicons name="thumbs-up-outline" size={16} color={colors.success} />
                        </Pressable>
                        <Pressable onPress={() => submitRating(item.id, -1)} style={styles.actionIconButton}>
                          <Ionicons name="thumbs-down-outline" size={16} color={colors.warning} />
                        </Pressable>
                      </View>

                      {/* Follow-up Questions chips */}
                      {item.metadata?.followUpQuestions && item.metadata.followUpQuestions.length > 0 && (
                        <View style={styles.followUpsContainer}>
                          {item.metadata.followUpQuestions.map((q, idx) => (
                            <Pressable
                              key={idx}
                              style={styles.followUpChip}
                              onPress={() => sendMessage(q)}
                            >
                              <Text style={styles.followUpText}>{q}</Text>
                              <Ionicons name="arrow-forward" size={12} color={colors.brand} />
                            </Pressable>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
            );
          })}

          {/* Typing/Streaming Loading Indicator */}
          {sending && (
            <View style={styles.aiMessageRow}>
              <Image source={{ uri: ASSETS.images.aiCoachAvatar }} style={styles.chatAvatar} />
              <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
                <ActivityIndicator size="small" color={colors.brand} />
                <Text style={styles.typingText}>Diet Coach is writing...</Text>
              </View>
            </View>
          )}

          {/* Empty State Prompt */}
          {messages.length === 0 && !loading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="sparkles" size={48} color={`${colors.brand}40`} />
              <Text style={styles.emptyTitle}>Personal Diet Coach</Text>
              <Text style={styles.emptySubtitle}>
                Ask questions about your calories, workouts, Indian protein foods, or log checkups.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Suggestion Chips */}
        {messages.length === 0 && suggestions.length > 0 && (
          <View style={styles.suggestionsWrapper}>
            <Text style={styles.suggestionsHeader}>Quick Prompts:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
              {suggestions.map((q, idx) => (
                <Pressable key={idx} onPress={() => sendMessage(q)} style={styles.suggestionChip}>
                  <Text style={styles.suggestionText}>{q}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Action Panel: Regenerate button if conversation is active */}
        {messages.length > 0 && currentConversationId && (
          <View style={styles.chatActionPanel}>
            <Pressable onPress={regenerateLast} disabled={sending} style={styles.regenerateBtn}>
              <Ionicons name="refresh" size={14} color={colors.brand} />
              <Text style={styles.regenerateText}>Regenerate response</Text>
            </Pressable>
          </View>
        )}

        {/* Chat Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            placeholder="Ask your AI Coach..."
            placeholderTextColor={colors.onSurfaceTertiary}
            value={inputText}
            onChangeText={setInputText}
            style={styles.textInput}
            onSubmitEditing={handleSend}
            editable={!sending}
          />
          <Pressable onPress={handleSend} disabled={sending || !inputText.trim()} style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled
          ]}>
            <Ionicons name="send" size={16} color={colors.surface} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  headerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 36,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
    textAlign: 'center',
  },
  historyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  historyToggleText: {
    fontSize: 13,
    color: colors.brand,
    fontWeight: '600',
  },
  newChatButton: {
    padding: spacing.xs,
  },
  historyPanel: {
    backgroundColor: colors.surfaceSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    maxHeight: '40%',
    padding: spacing.md,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  historyScroll: {
    flexGrow: 0,
  },
  historyList: {
    gap: spacing.xs,
  },
  historyItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyItemRowActive: {
    borderColor: colors.brand,
    backgroundColor: `${colors.brand}05`,
  },
  historyItemPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  historyItemText: {
    fontSize: 13,
    color: colors.onSurface,
    flex: 1,
  },
  historyItemTextActive: {
    fontWeight: '700',
    color: colors.brand,
  },
  deleteConvoButton: {
    padding: spacing.xs,
  },
  noHistoryText: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  loader: {
    marginVertical: spacing.md,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'space-between',
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    maxWidth: '85%',
  },
  aiMessageRow: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
    maxWidth: '85%',
  },
  userMessageRow: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
    marginBottom: spacing.md,
    maxWidth: '80%',
  },
  chatAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  bubbleContainer: {
    flex: 1,
    gap: 4,
  },
  messageBubble: {
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  aiBubble: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopLeftRadius: 2,
  },
  userBubble: {
    backgroundColor: colors.brand,
    borderTopRightRadius: 2,
  },
  aiText: {
    color: colors.onSurface,
  },
  userText: {
    color: colors.surface,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  aiMetaContainer: {
    paddingLeft: 4,
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  macrosCard: {
    padding: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.onSurfaceSecondary,
    marginBottom: spacing.xs,
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroCol: {
    alignItems: 'center',
    flex: 1,
  },
  macroVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurface,
  },
  macroSub: {
    fontSize: 9,
    color: colors.onSurfaceSecondary,
  },
  warningAlert: {
    flexDirection: 'row',
    backgroundColor: `${colors.warning}10`,
    padding: spacing.sm,
    borderRadius: radius.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: `${colors.warning}20`,
  },
  warningTextList: {
    flex: 1,
  },
  warningText: {
    fontSize: 12,
    color: colors.warning,
    lineHeight: 16,
  },
  tagsContainer: {
    gap: spacing.xs,
  },
  tagsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurfaceSecondary,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  foodTag: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  foodTagText: {
    fontSize: 11,
    color: colors.onSurface,
    fontWeight: '500',
  },
  mealsContainer: {
    gap: spacing.xs,
  },
  mealItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingLeft: 4,
  },
  mealItemText: {
    fontSize: 12,
    color: colors.onSurface,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 2,
  },
  actionIconButton: {
    padding: 4,
  },
  followUpsContainer: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  followUpChip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: `${colors.brand}08`,
    borderWidth: 1,
    borderColor: `${colors.brand}15`,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  followUpText: {
    fontSize: 12,
    color: colors.brand,
    fontWeight: '600',
    flex: 1,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  typingText: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.onSurface,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  suggestionsWrapper: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  suggestionsHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurfaceSecondary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  suggestionsScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  suggestionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: {
    fontSize: 12,
    color: colors.brand,
    fontWeight: '600',
  },
  chatActionPanel: {
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  regenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.xs,
  },
  regenerateText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.brand,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.sm,
  },
  textInput: {
    flex: 1,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceTertiary,
    color: colors.onSurface,
    paddingHorizontal: spacing.md,
    fontSize: 14,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: `${colors.brand}50`,
  },
});
export default ChatContainer;
