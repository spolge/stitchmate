import {useStore} from '../../app/store';
import useSound from 'use-sound';
import {FaMinus} from "react-icons/fa6";
import {Button} from '../ui/button';

export default function CountDownButton (): JSX.Element {
  const {countDown, clickSoundEnabled} = useStore();

  const [play] = useSound('/click-2.mp3');

  function handleCountDown ():void {
    countDown();
    if (clickSoundEnabled) {
      play();
    }
  }

  return (
    <Button data-testid="decrement-count" size='icon' variant='secondary' className='' onClick={handleCountDown}>
      <FaMinus className='fill-neutral-50' />
    </Button>
  );
}