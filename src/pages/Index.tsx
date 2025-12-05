import { HeroSection } from '@/components/home/HeroSection';
import { TopUniversities } from '@/components/home/TopUniversities';
import { FieldsGrid } from '@/components/home/FieldsGrid';
import { ComparePromo } from '@/components/home/ComparePromo';
import { AIAssistantPromo } from '@/components/home/AIAssistantPromo';

const Index = () => {
  const handleOpenChat = () => {
    // Trigger chat widget by clicking the chat button
    const chatButton = document.querySelector('[data-chat-trigger]');
    if (chatButton) {
      (chatButton as HTMLButtonElement).click();
    }
  };

  return (
    <>
      <HeroSection />
      <TopUniversities />
      <FieldsGrid />
      <ComparePromo />
      <AIAssistantPromo onOpenChat={handleOpenChat} />
    </>
  );
};

export default Index;
