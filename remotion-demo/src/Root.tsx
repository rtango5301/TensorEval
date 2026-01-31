import { Composition } from 'remotion';
import { TensorEvalDemo } from './TensorEvalDemo';
import { VIDEO_FPS, VIDEO_WIDTH, VIDEO_HEIGHT, TOTAL_FRAMES } from './styles';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TensorEvalDemo"
        component={TensorEvalDemo}
        durationInFrames={TOTAL_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />
    </>
  );
};
