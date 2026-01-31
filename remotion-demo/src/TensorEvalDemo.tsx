import { AbsoluteFill, Sequence } from 'remotion';
import { MacBookFrame } from './components/MacBookFrame';
import { DashboardScene } from './sequences/DashboardScene';
import { AgentsPageScene } from './sequences/AgentsPageScene';
import { NewAgentScene } from './sequences/NewAgentScene';
import { ConfigurePageScene } from './sequences/ConfigurePageScene';
import { ReviewPageScene } from './sequences/ReviewPageScene';
import { SuccessScene } from './sequences/SuccessScene';
import { SCENE_FRAMES } from './styles';

export const TensorEvalDemo: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#1a1a2e',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <MacBookFrame title="tensoreval.app" width={1220} height={680}>
        {/* Scene 1: Dashboard */}
        <Sequence
          from={SCENE_FRAMES.dashboard.start}
          durationInFrames={SCENE_FRAMES.dashboard.duration}
        >
          <DashboardScene />
        </Sequence>

        {/* Scene 2: Agents Management */}
        <Sequence
          from={SCENE_FRAMES.agentsPage.start}
          durationInFrames={SCENE_FRAMES.agentsPage.duration}
        >
          <AgentsPageScene />
        </Sequence>

        {/* Scene 3: Create Agent Step 1 */}
        <Sequence
          from={SCENE_FRAMES.newAgentPage.start}
          durationInFrames={SCENE_FRAMES.newAgentPage.duration}
        >
          <NewAgentScene />
        </Sequence>

        {/* Scene 4: Configure (Step 2) */}
        <Sequence
          from={SCENE_FRAMES.configurePage.start}
          durationInFrames={SCENE_FRAMES.configurePage.duration}
        >
          <ConfigurePageScene />
        </Sequence>

        {/* Scene 5: Review (Step 3) */}
        <Sequence
          from={SCENE_FRAMES.reviewPage.start}
          durationInFrames={SCENE_FRAMES.reviewPage.duration}
        >
          <ReviewPageScene />
        </Sequence>

        {/* Scene 6: Success State */}
        <Sequence
          from={SCENE_FRAMES.successPage.start}
          durationInFrames={SCENE_FRAMES.successPage.duration}
        >
          <SuccessScene />
        </Sequence>
      </MacBookFrame>
    </AbsoluteFill>
  );
};
