import React from 'react';
import { StatusBar } from 'react-native';
import MorseCodeConverter from './screens/BrailleLetterScreen'; // Import our Morse Code component
import BrailleLetterScreen from './screens/BrailleLetterScreen';
import BrailleKeyboard from './screens/BrailleLetterScreen';

const App = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <BrailleKeyboard />
    </>
  );
};

export default App;