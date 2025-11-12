export const playSound = (type: 'transition' | 'complete' | 'overtime') => {
  if (typeof window === 'undefined') return;
  
  console.log('Playing sound:', type);
  
  try {
    const audio = new Audio('/click.mp3');
    audio.volume = 0.1;
    audio.play().catch(error => {
      console.warn('Error playing sound:', error);
    });
  } catch (error) {
    console.warn('Error creating audio:', error);
  }
};

