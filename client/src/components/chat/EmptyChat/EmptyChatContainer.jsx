import Animation from '../../animation';
import Logo from '../../common/Logo';

function EmptyChatContainer() {
  return (
    <div className='h-full'>
      <div className="flex-1 h-full flex flex-col justify-center items-center duration-1000 transition-all">
        <Animation className="size-96" />
        <Logo className="text-5xl" />
        <p className="poppins-medium text-lg text-gray-600">
          Let the banter begin!
        </p>
      </div>
    </div>
  );
}

export default EmptyChatContainer;
