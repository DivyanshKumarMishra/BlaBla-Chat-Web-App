import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Animation = ({ className = '', src = '/animations/welcome.lottie' }) => {
  return (
    <DotLottieReact
      src={src}
      loop
      autoplay
      className={`${className} mx-auto`}
    />
  );
};

export default Animation;
