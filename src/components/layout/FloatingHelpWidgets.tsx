import { useEffect, useState, useCallback } from 'react';
import { AccessibilityWidget } from '@/components/ui/AccessibilityWidget';
import { ChatWidget } from '@/components/ui/ChatWidget';
import { HumanChatWidget } from '@/components/ui/HumanChatWidget';
import { useIsPortalRoute } from '@/hooks/useIsPortalRoute';

export function FloatingHelpWidgets() {
  const isPortal = useIsPortalRoute();
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isHumanChatOpen, setIsHumanChatOpen] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);

  const openAccessibility = useCallback(() => {
    setIsAccessibilityOpen(true);
    setIsAiChatOpen(false);
    setIsHumanChatOpen(false);
  }, []);

  const openAiChat = useCallback(() => {
    setIsAiChatOpen(true);
    setIsAccessibilityOpen(false);
    setIsHumanChatOpen(false);
  }, []);

  const openHumanChat = useCallback(() => {
    setIsHumanChatOpen(true);
    setIsAccessibilityOpen(false);
    setIsAiChatOpen(false);
  }, []);

  useEffect(() => {
    const onAccessibility = () => openAccessibility();
    const onChat = () => openAiChat();
    window.addEventListener('app:open-accessibility', onAccessibility);
    window.addEventListener('app:open-chat', onChat);
    return () => {
      window.removeEventListener('app:open-accessibility', onAccessibility);
      window.removeEventListener('app:open-chat', onChat);
    };
  }, [openAccessibility, openAiChat]);

  if (isPortal) return null;

  return (
    <>
      <AccessibilityWidget
        open={isAccessibilityOpen}
        onOpenChange={setIsAccessibilityOpen}
        onOpenChat={openAiChat}
      />
      <ChatWidget
        isOpen={isAiChatOpen}
        onOpenChange={setIsAiChatOpen}
        onRequestHuman={openHumanChat}
      />
      <HumanChatWidget
        isOpen={isHumanChatOpen}
        onOpenChange={setIsHumanChatOpen}
      />
    </>
  );
}
