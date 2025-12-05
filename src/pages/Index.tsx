import { HeroSection } from '@/components/home/HeroSection';
import { TopUniversities } from '@/components/home/TopUniversities';
import { FieldsGrid } from '@/components/home/FieldsGrid';
import { ComparePromo } from '@/components/home/ComparePromo';
import { AIAssistantPromo } from '@/components/home/AIAssistantPromo';

const Index = () => {
  const handleOpenChat = (question?: string) => {
    // Dispatch custom event to open chat with optional question
    window.dispatchEvent(new CustomEvent('open-chat-with-question', { 
      detail: { question } 
    }));
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
