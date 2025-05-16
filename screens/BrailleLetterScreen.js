import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Vibration,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';

// Morse code dictionary
const MORSE_CODE = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.',
  'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
  'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---',
  'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
  'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--',
  'Z': '--..', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '0': '-----', ' ': '/', '.': '.-.-.-', ',': '--..--', '?': '..--..',
  "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
  '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.',
  '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
};

// Vibration pattern durations in milliseconds
const DOT_DURATION = 200;
const DASH_DURATION = DOT_DURATION * 3;
const SYMBOL_PAUSE = DOT_DURATION;
const LETTER_PAUSE = DOT_DURATION * 3;
const WORD_PAUSE = DOT_DURATION * 7;

const MorseCodeConverter = () => {
  const [text, setText] = useState('');
  const [morseCode, setMorseCode] = useState('');
  const [isVibrating, setIsVibrating] = useState(false);

  // Convert text to Morse code
  const convertToMorse = (input) => {
    const upperText = input.toUpperCase();
    let morse = '';

    for (let i = 0; i < upperText.length; i++) {
      const char = upperText[i];
      if (MORSE_CODE[char]) {
        morse += MORSE_CODE[char] + ' ';
      }
    }

    const trimmedMorse = morse.trim();
    setMorseCode(trimmedMorse);
    return trimmedMorse;
  };

  // Handle text input changes
  const handleTextChange = (input) => {
    setText(input);
    convertToMorse(input);
  };

  // Create vibration pattern from Morse code
  const createVibrationPattern = (morse) => {
    const pattern = [];
    let isFirst = true;

    for (let i = 0; i < morse.length; i++) {
      const char = morse[i];
      
      if (!isFirst) {
        pattern.push(SYMBOL_PAUSE);
      } else {
        isFirst = false;
      }

      if (char === '.') {
        pattern.push(DOT_DURATION);
      } else if (char === '-') {
        pattern.push(DASH_DURATION);
      } else if (char === ' ') {
        pattern.push(LETTER_PAUSE);
        isFirst = true;
      } else if (char === '/') {
        pattern.push(WORD_PAUSE);
        isFirst = true;
      }
    }

    return pattern;
  };

  // Vibrate with Morse code pattern
  const vibrateWithMorseCode = async () => {
    if (morseCode && !isVibrating) {
      setIsVibrating(true);
      const pattern = createVibrationPattern(morseCode);
      const totalDuration = pattern.reduce((sum, duration) => sum + duration, 0);

      if (Platform.OS === 'android') {
        Vibration.vibrate(pattern);
        setTimeout(() => setIsVibrating(false), totalDuration);
      } else {
        // iOS implementation with sequential vibrations
        let delay = 0;
        for (let i = 0; i < pattern.length; i += 2) {
          const duration = pattern[i];
          const pause = pattern[i + 1] || 0;
          
          setTimeout(() => {
            Vibration.vibrate(duration);
          }, delay);
          
          delay += duration + pause;
        }
        
        setTimeout(() => setIsVibrating(false), delay);
      }
    }
  };

  // Stop ongoing vibrations
  const stopVibration = () => {
    Vibration.cancel();
    setIsVibrating(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Morse Code Vibration</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Enter Text:</Text>
          <TextInput
            style={styles.textInput}
            value={text}
            onChangeText={handleTextChange}
            placeholder="Type message here..."
            autoCapitalize="none"
            multiline
          />
        </View>
        
        <View style={styles.outputContainer}>
          <Text style={styles.label}>Morse Code:</Text>
          <Text style={styles.morseOutput}>{morseCode}</Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, isVibrating && styles.buttonDisabled]}
            onPress={vibrateWithMorseCode}
            disabled={isVibrating || !morseCode}
          >
            <Text style={styles.buttonText}>
              {isVibrating ? 'Vibrating...' : 'Start Vibration'}
            </Text>
          </TouchableOpacity>
          
          {isVibrating && (
            <TouchableOpacity
              style={[styles.button, styles.stopButton]}
              onPress={stopVibration}
            >
              <Text style={styles.buttonText}>Stop</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Morse Code Legend:</Text>
          <Text style={styles.legendText}>• Dot (.) = Short vibration</Text>
          <Text style={styles.legendText}>• Dash (-) = Long vibration</Text>
          <Text style={styles.legendText}>• Space between letters = Pause</Text>
          <Text style={styles.legendText}>• Slash (/) = Word break</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#555',
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  outputContainer: {
    marginBottom: 20,
  },
  morseOutput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4285f4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonDisabled: {
    backgroundColor: '#a0c4ff',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  legendContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 10,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  legendText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
});

export default MorseCodeConverter;




// // import React, { useState, useEffect } from 'react';
// // import { 
// //   View, 
// //   Text, 
// //   TouchableOpacity, 
// //   StyleSheet, 
// //   Vibration,
// //   AccessibilityInfo,
// //   Platform
// // } from 'react-native';
// // import * as Speech from 'expo-speech';
// // import * as Haptics from 'expo-haptics';

// // const BrailleLetterScreen = () => {
// //   const [currentLetter, setCurrentLetter] = useState('B');
// //   const [userTouched, setUserTouched] = useState([false, false, false, false, false, false]);
// //   const [isCorrect, setIsCorrect] = useState(null);
// //   const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
// //   const [mode, setMode] = useState('letter'); // 'letter' or 'sentence'
// //   const [currentSentence, setCurrentSentence] = useState('HELLO');
// //   const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

// //   useEffect(() => {
// //     const checkScreenReader = async () => {
// //       const isEnabled = await AccessibilityInfo.isScreenReaderEnabled();
// //       setScreenReaderEnabled(isEnabled);
// //     };
    
// //     checkScreenReader();
// //     const subscription = AccessibilityInfo.addEventListener(
// //       'screenReaderChanged',
// //       isEnabled => setScreenReaderEnabled(isEnabled)
// //     );
    
// //     announceScreen();
    
// //     return () => subscription.remove();
// //   }, [mode, currentLetter, currentSentence, currentSentenceIndex]);

// //   const braillePatterns = {
// //     'A': [1, 0, 0, 0, 0, 0],
// //     'B': [1, 1, 0, 0, 0, 0],
// //     'C': [1, 0, 0, 1, 0, 0],
// //     'D': [1, 0, 0, 1, 1, 0],
// //     'E': [1, 0, 0, 0, 1, 0],
// //     'F': [1, 1, 0, 1, 0, 0],
// //     'G': [1, 1, 0, 1, 1, 0],
// //     'H': [1, 1, 0, 0, 1, 0],
// //     'I': [0, 1, 0, 1, 0, 0],
// //     'J': [0, 1, 0, 1, 1, 0],
// //     'K': [1, 0, 1, 0, 0, 0],
// //     'L': [1, 1, 1, 0, 0, 0],
// //     'M': [1, 0, 1, 1, 0, 0],
// //     'N': [1, 0, 1, 1, 1, 0],
// //     'O': [1, 0, 1, 0, 1, 0],
// //     'P': [1, 1, 1, 1, 0, 0],
// //     'Q': [1, 1, 1, 1, 1, 0],
// //     'R': [1, 1, 1, 0, 1, 0],
// //     'S': [0, 1, 1, 1, 0, 0],
// //     'T': [0, 1, 1, 1, 1, 0],
// //     'U': [1, 0, 1, 0, 0, 1],
// //     'V': [1, 1, 1, 0, 0, 1],
// //     'W': [0, 1, 0, 1, 1, 1],
// //     'X': [1, 0, 1, 1, 0, 1],
// //     'Y': [1, 0, 1, 1, 1, 1],
// //     'Z': [1, 0, 1, 0, 1, 1],
// //   };

// //   const sampleSentences = [
// //     'HELLO',
// //     'WORLD',
// //     'BRAILLE',
// //     'LEARN',
// //     'FUN'
// //   ];

// //   const announceScreen = () => {
// //     let message = mode === 'letter' 
// //       ? `Braille learning screen. This is the letter ${currentLetter}. Double tap on the dots to feel the Braille pattern.`
// //       : `Braille sentence practice. Current sentence is ${currentSentence}. Current letter is ${currentSentence[currentSentenceIndex]}. Position ${currentSentenceIndex + 1} of ${currentSentence.length}.`;
// //     Speech.speak(message, { language: 'en', pitch: 1.0, rate: 0.9 });
// //   };

// //   const toggleDot = (index) => {
// //     const newTouched = [...userTouched];
// //     newTouched[index] = !newTouched[index];
// //     setUserTouched(newTouched);
    
// //     if (Platform.OS === 'ios') {
// //       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
// //     } else {
// //       Vibration.vibrate(100);
// //     }
    
// //     checkPattern(newTouched);
// //   };

// //   const checkPattern = (touchedPattern) => {
// //     const targetLetter = mode === 'letter' ? currentLetter : currentSentence[currentSentenceIndex];
// //     const correctPattern = braillePatterns[targetLetter];
// //     const isPatternCorrect = touchedPattern.every((dot, index) => dot === Boolean(correctPattern[index]));
    
// //     if (isPatternCorrect && touchedPattern.some(dot => dot)) {
// //       setIsCorrect(true);
// //       if (Platform.OS === 'ios') {
// //         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
// //       } else {
// //         Vibration.vibrate([0, 100, 100, 100, 300]);
// //       }
// //       Speech.speak("Correct! Well done!", { rate: 0.9 });
// //     } else if (touchedPattern.some(dot => dot)) {
// //       setIsCorrect(false);
// //     }
// //   };

// //   const nextItem = () => {
// //     if (mode === 'letter') {
// //       const letters = Object.keys(braillePatterns);
// //       const currentIndex = letters.indexOf(currentLetter);
// //       const nextIndex = (currentIndex + 1) % letters.length;
// //       setCurrentLetter(letters[nextIndex]);
// //       setUserTouched([false, false, false, false, false, false]);
// //       setIsCorrect(null);
// //       setTimeout(() => {
// //         Speech.speak(`This is the letter ${letters[nextIndex]}.`, { rate: 0.9 });
// //       }, 500);
// //     } else {
// //       if (currentSentenceIndex < currentSentence.length - 1) {
// //         setCurrentSentenceIndex(currentSentenceIndex + 1);
// //         setUserTouched([false, false, false, false, false, false]);
// //         setIsCorrect(null);
// //       } else {
// //         const currentSentenceIndex = sampleSentences.indexOf(currentSentence);
// //         const nextSentenceIndex = (currentSentenceIndex + 1) % sampleSentences.length;
// //         setCurrentSentence(sampleSentences[nextSentenceIndex]);
// //         setCurrentSentenceIndex(0);
// //         setUserTouched([false, false, false, false, false, false]);
// //         setIsCorrect(null);
// //       }
// //       setTimeout(announceScreen, 500);
// //     }
// //   };

// //   const prevItem = () => {
// //     if (mode === 'letter') {
// //       const letters = Object.keys(braillePatterns);
// //       const currentIndex = letters.indexOf(currentLetter);
// //       const prevIndex = currentIndex === 0 ? letters.length - 1 : currentIndex - 1;
// //       setCurrentLetter(letters[prevIndex]);
// //       setUserTouched([false, false, false, false, false, false]);
// //       setIsCorrect(null);
// //       setTimeout(() => {
// //         Speech.speak(`This is the letter ${letters[prevIndex]}.`, { rate: 0.9 });
// //       }, 500);
// //     } else {
// //       if (currentSentenceIndex > 0) {
// //         setCurrentSentenceIndex(currentSentenceIndex - 1);
// //         setUserTouched([false, false, false, false, false, false]);
// //         setIsCorrect(null);
// //       } else {
// //         const currentSentenceIndex = sampleSentences.indexOf(currentSentence);
// //         const prevSentenceIndex = currentSentenceIndex === 0 ? sampleSentences.length - 1 : currentSentenceIndex - 1;
// //         setCurrentSentence(sampleSentences[prevSentenceIndex]);
// //         setCurrentSentenceIndex(0);
// //         setUserTouched([false, false, false, false, false, false]);
// //         setIsCorrect(null);
// //       }
// //       setTimeout(announceScreen, 500);
// //     }
// //   };

// //   const speakCurrent = () => {
// //     if (mode === 'letter') {
// //       const pattern = braillePatterns[currentLetter];
// //       const activeDots = pattern.reduce((acc, dot, index) => dot ? [...acc, index + 1] : acc, []);
// //       const dotDescription = activeDots.length > 0 
// //         ? `with dots ${activeDots.join(', ')} raised` 
// //         : 'with no dots raised';
// //       Speech.speak(`This is the letter ${currentLetter}, ${dotDescription}.`, { rate: 0.9 });
// //     } else {
// //       const letter = currentSentence[currentSentenceIndex];
// //       const pattern = braillePatterns[letter];
// //       const activeDots = pattern.reduce((acc, dot, index) => dot ? [...acc, index + 1] : acc, []);
// //       const dotDescription = activeDots.length > 0 
// //         ? `with dots ${activeDots.join(', ')} raised` 
// //         : 'with no dots raised';
// //       Speech.speak(`Letter ${letter} in sentence ${currentSentence}, position ${currentSentenceIndex + 1}, ${dotDescription}.`, { rate: 0.9 });
// //     }
// //   };

// //   const toggleMode = () => {
// //     setMode(mode === 'letter' ? 'sentence' : 'letter');
// //     setCurrentLetter('A');
// //     setCurrentSentence(sampleSentences[0]);
// //     setCurrentSentenceIndex(0);
// //     setUserTouched([false, false, false, false, false, false]);
// //     setIsCorrect(null);
// //     setTimeout(announceScreen, 500);
// //   };

// //   const renderDot = (index) => {
// //     const targetLetter = mode === 'letter' ? currentLetter : currentSentence[currentSentenceIndex];
// //     const correctPattern = braillePatterns[targetLetter];
// //     const isDotActive = correctPattern[index] === 1;
// //     const isPressed = userTouched[index];
    
// //     return (
// //       <TouchableOpacity
// //         key={index}
// //         style={[
// //           styles.dot,
// //           isDotActive && styles.activeDot,
// //           isPressed && styles.pressedDot
// //         ]}
// //         onPress={() => toggleDot(index)}
// //         accessible={true}
// //         accessibilityLabel={`Braille dot ${index + 1}, ${isDotActive ? 'active' : 'inactive'}`}
// //         accessibilityHint="Double tap to toggle this dot"
// //       />
// //     );
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <View style={styles.header}>
// //         <Text style={styles.headerText}>Learn Braille</Text>
// //         <TouchableOpacity 
// //           style={styles.modeButton}
// //           onPress={toggleMode}
// //           accessible={true}
// //           accessibilityLabel={`Switch to ${mode === 'letter' ? 'sentence' : 'letter'} mode`}
// //         >
// //           <Text style={styles.modeButtonText}>
// //             {mode === 'letter' ? 'Sentence Mode' : 'Letter Mode'}
// //           </Text>
// //         </TouchableOpacity>
// //       </View>
      
// //       <View style={styles.letterContainer}>
// //         <Text style={styles.letterText}>
// //           {mode === 'letter' 
// //             ? `Letter ${currentLetter}` 
// //             : `${currentSentence} (${currentSentenceIndex + 1}/${currentSentence.length})`}
// //         </Text>
// //         <TouchableOpacity 
// //           style={styles.speakButton}
// //           onPress={speakCurrent}
// //           accessible={true}
// //           accessibilityLabel="Speak current"
// //         >
// //           <Text style={styles.speakButtonText}>🔊 Speak</Text>
// //         </TouchableOpacity>
// //       </View>
      
// //       <View style={styles.brailleContainer}>
// //         <View style={styles.brailleCell}>
// //           <View style={styles.dotRow}>{renderDot(0)}{renderDot(3)}</View>
// //           <View style={styles.dotRow}>{renderDot(1)}{renderDot(4)}</View>
// //           <View style={styles.dotRow}>{renderDot(2)}{renderDot(5)}</View>
// //         </View>
// //       </View>
      
// //       {isCorrect !== null && (
// //         <View style={styles.feedbackContainer}>
// //           <Text style={[styles.feedbackText, isCorrect ? styles.correctFeedback : styles.incorrectFeedback]}>
// //             {isCorrect ? '✓ Correct!' : '✗ Try again'}
// //           </Text>
// //         </View>
// //       )}
      
// //       <View style={styles.navigationContainer}>
// //         <TouchableOpacity 
// //           style={styles.navButton}
// //           onPress={prevItem}
// //           accessible={true}
// //           accessibilityLabel="Previous"
// //         >
// //           <Text style={styles.navButtonText}>◄ Previous</Text>
// //         </TouchableOpacity>
// //         <TouchableOpacity 
// //           style={styles.navButton}
// //           onPress={nextItem}
// //           accessible={true}
// //           accessibilityLabel="Next"
// //         >
// //           <Text style={styles.navButtonText}>Next ►</Text>
// //         </TouchableOpacity>
// //       </View>
      
// //       <View style={styles.instructionContainer}>
// //         <Text style={styles.instructionText}>
// //           {mode === 'letter'
// //             ? `Tap the dots to match the Braille pattern for the letter ${currentLetter}.`
// //             : `Tap the dots to match the Braille pattern for letter ${currentSentence[currentSentenceIndex]} in ${currentSentence}.`}
// //           Your device will vibrate to provide feedback.
// //         </Text>
// //       </View>
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#f5f5f5',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     padding: 20,
// //   },
// //   header: {
// //     width: '100%',
// //     paddingVertical: 20,
// //     alignItems: 'center',
// //   },
// //   headerText: {
// //     fontSize: 28,
// //     fontWeight: 'bold',
// //     color: '#2c3e50',
// //   },
// //   modeButton: {
// //     marginTop: 10,
// //     backgroundColor: '#e67e22',
// //     padding: 10,
// //     borderRadius: 5,
// //   },
// //   modeButtonText: {
// //     color: 'white',
// //     fontSize: 16,
// //   },
// //   letterContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     width: '80%',
// //     marginVertical: 20,
// //   },
// //   letterText: {
// //     fontSize: 24,
// //     fontWeight: 'bold',
// //     color: '#3498db',
// //   },
// //   speakButton: {
// //     backgroundColor: '#3498db',
// //     paddingHorizontal: 15,
// //     paddingVertical: 10,
// //     borderRadius: 20,
// //   },
// //   speakButtonText: {
// //     color: 'white',
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //   },
// //   brailleContainer: {
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     marginVertical: 20,
// //   },
// //   brailleCell: {
// //     backgroundColor: '#f0f0f0',
// //     borderRadius: 20,
// //     padding: 25,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 3 },
// //     shadowOpacity: 0.2,
// //     shadowRadius: 5,
// //     elevation: 5,
// //   },
// //   dotRow: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     marginVertical: 10,
// //   },
// //   dot: {
// //     width: 50,
// //     height: 50,
// //     borderRadius: 25,
// //     backgroundColor: '#e0e0e0',
// //     margin: 10,
// //     borderWidth: 2,
// //     borderColor: '#bbb',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.2,
// //     shadowRadius: 3,
// //     elevation: 3,
// //   },
// //   activeDot: {
// //     backgroundColor: '#bfe6ff',
// //     borderColor: '#3498db',
// //   },
// //   pressedDot: {
// //     backgroundColor: '#3498db',
// //     borderColor: '#2980b9',
// //     transform: [{ scale: 1.05 }],
// //   },
// //   feedbackContainer: {
// //     marginVertical: 20,
// //     padding: 10,
// //   },
// //   feedbackText: {
// //     fontSize: 24,
// //     fontWeight: 'bold',
// //   },
// //   correctFeedback: {
// //     color: '#27ae60',
// //   },
// //   incorrectFeedback: {
// //     color: '#e74c3c',
// //   },
// //   navigationContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     width: '80%',
// //     marginVertical: 20,
// //   },
// //   navButton: {
// //     backgroundColor: '#2c3e50',
// //     paddingHorizontal: 20,
// //     paddingVertical: 15,
// //     borderRadius: 10,
// //     width: '45%',
// //     alignItems: 'center',
// //   },
// //   navButtonText: {
// //     color: 'white',
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //   },
// //   instructionContainer: {
// //     width: '90%',
// //     alignItems: 'center',
// //     marginBottom: 20,
// //   },
// //   instructionText: {
// //     fontSize: 16,
// //     textAlign: 'center',
// //     color: '#7f8c8d',
// //     lineHeight: 22,
// //   },
// // });

// // export default BrailleLetterScreen;


// import React, { useState, useEffect } from 'react';
// import { 
//   View, 
//   Text, 
//   TouchableOpacity, 
//   StyleSheet, 
//   Vibration,
//   Dimensions,
//   StatusBar
// } from 'react-native';

// const BrailleKeyboard = () => {
//   const [currentDisplay, setCurrentDisplay] = useState('a');
//   const [dots, setDots] = useState([false, false, false, false, false, false]);
//   const [inputMode, setInputMode] = useState('alphabets'); // 'alphabets' or 'numbers'
//   const [typedText, setTypedText] = useState('');

//   // Predefined mappings for Braille patterns to characters
//   const alphabetMappings = {
//     '100000': 'a', '110000': 'b', '100100': 'c', '100110': 'd', '100010': 'e',
//     '110100': 'f', '110110': 'g', '110010': 'h', '010100': 'i', '010110': 'j',
//     '101000': 'k', '111000': 'l', '101100': 'm', '101110': 'n', '101010': 'o',
//     '111100': 'p', '111110': 'q', '111010': 'r', '011100': 's', '011110': 't',
//     '101001': 'u', '111001': 'v', '010111': 'w', '101101': 'x', '101111': 'y',
//     '101011': 'z'
//   };

//   const numberMappings = {
//     '010110': '1', '110000': '2', '100100': '3', '100110': '4', '100010': '5',
//     '110100': '6', '110110': '7', '110010': '8', '010100': '9', '010110': '0'
//   };

//   // Custom vibration patterns for each dot
//   const vibrationPatterns = [
//     [100, 50, 100], // Dot 1: short-pause-short
//     [200, 50, 100], // Dot 2: medium-pause-short
//     [300, 50, 100], // Dot 3: long-pause-short
//     [100, 50, 200], // Dot 4: short-pause-medium
//     [200, 50, 200], // Dot 5: medium-pause-medium
//     [300, 50, 200]  // Dot 6: long-pause-medium
//   ];

//   // Handle hardware volume button press (simulated here)
//   useEffect(() => {
//     // In a real app, you would need to use a native module to detect volume button presses
//     console.log(`Current input mode: ${inputMode}`);
//     // For testing purposes only - this doesn't actually connect to volume buttons
//   }, [inputMode]);

//   // Toggle a specific dot
//   const toggleDot = (index) => {
//     const newDots = [...dots];
//     newDots[index] = !newDots[index];
//     setDots(newDots);
    
//     // Provide unique haptic feedback for this dot
//     Vibration.vibrate(vibrationPatterns[index]);
    
//     // Convert the current dot pattern to a character
//     const dotString = newDots.map(dot => dot ? '1' : '0').join('');
//     const mappings = inputMode === 'alphabets' ? alphabetMappings : numberMappings;
    
//     if (mappings[dotString]) {
//       setCurrentDisplay(mappings[dotString]);
//     } else {
//       setCurrentDisplay('?');
//     }
//   };

//   // Add the current character to the typed text
//   const commitCharacter = () => {
//     if (currentDisplay !== '?') {
//       setTypedText(typedText + currentDisplay);
//       // Reset dots after committing a character
//       setDots([false, false, false, false, false, false]);
//       setCurrentDisplay('');
      
//       // Provide confirmation vibration
//       Vibration.vibrate([100, 50, 200, 50, 100]);
//     }
//   };

//   // Add a space to the typed text
//   const addSpace = () => {
//     setTypedText(typedText + ' ');
//     // Provide space vibration feedback
//     Vibration.vibrate([50, 30, 50]);
//   };

//   // Switch between alphabets and numbers mode
//   const toggleInputMode = () => {
//     const newMode = inputMode === 'alphabets' ? 'numbers' : 'alphabets';
//     setInputMode(newMode);
    
//     // Provide mode switch vibration feedback
//     Vibration.vibrate(newMode === 'alphabets' ? [300, 100, 300] : [100, 50, 100, 50, 100]);
    
//     // Reset dots when switching modes
//     setDots([false, false, false, false, false, false]);
//     setCurrentDisplay('');
//   };

//   // For demo purposes, we're simulating volume button press with this function
//   const simulateVolumeButton = (direction) => {
//     if (direction === 'up') {
//       setInputMode('alphabets');
//       Vibration.vibrate([300, 100, 300]); 
//     } else {
//       setInputMode('numbers');
//       Vibration.vibrate([100, 50, 100, 50, 100]);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar hidden />
      
//       {/* Mode indicator at top */}
//       <View style={styles.modeIndicator}>
//         <Text style={styles.modeText}>
//           Mode: {inputMode === 'alphabets' ? 'Alphabets' : 'Numbers'}
//         </Text>
//       </View>
      
//       {/* Central display area */}
//       <View style={styles.displayContainer}>
//         <Text style={styles.displayText}>{currentDisplay}</Text>
        
//         {/* Space button (center of screen) */}
//         <TouchableOpacity 
//           style={styles.spaceButton}
//           onPress={addSpace}
//           accessibilityLabel="Add space"
//           accessibilityHint="Double tap to add a space between words"
//         >
//           <Text style={styles.spaceButtonText}>SPACE</Text>
//         </TouchableOpacity>
        
//         {/* Typed text display */}
//         <Text style={styles.typedText}>{typedText}</Text>
        
//         {/* Submit button */}
//         <TouchableOpacity 
//           style={styles.submitButton}
//           onPress={commitCharacter}
//           accessibilityLabel="Submit current character"
//           accessibilityHint="Double tap to add the current character to your text"
//         >
//           <Text style={styles.submitButtonText}>ADD</Text>
//         </TouchableOpacity>
//       </View>
      
//       {/* Left side dots (4-6) */}
//       <View style={styles.leftDotsContainer}>
//         {[3, 4, 5].map((dotIndex) => (
//           <TouchableOpacity
//             key={`dot-${dotIndex+1}`}
//             style={[
//               styles.dot,
//               dots[dotIndex] && styles.activeDot
//             ]}
//             onPress={() => toggleDot(dotIndex)}
//             accessibilityLabel={`Dot ${dotIndex+1}`}
//             accessibilityHint={`Double tap to toggle dot ${dotIndex+1}`}
//           >
//             <Text style={styles.dotText}>{dotIndex+1}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>
      
//       {/* Right side dots (1-3) */}
//       <View style={styles.rightDotsContainer}>
//         {[0, 1, 2].map((dotIndex) => (
//           <TouchableOpacity
//             key={`dot-${dotIndex+1}`}
//             style={[
//               styles.dot,
//               dots[dotIndex] && styles.activeDot
//             ]}
//             onPress={() => toggleDot(dotIndex)}
//             accessibilityLabel={`Dot ${dotIndex+1}`}
//             accessibilityHint={`Double tap to toggle dot ${dotIndex+1}`}
//           >
//             <Text style={styles.dotText}>{dotIndex+1}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>
      
//       {/* Volume button simulation - In real app, this would be handled by native code */}
//       <View style={styles.volumeSimulation}>
//         <TouchableOpacity 
//           style={styles.volumeButton}
//           onPress={() => simulateVolumeButton('up')}
//           accessibilityLabel="Switch to alphabets mode"
//         >
//           <Text style={styles.volumeButtonText}>Vol + (Alphabets)</Text>
//         </TouchableOpacity>
//         <TouchableOpacity 
//           style={styles.volumeButton}
//           onPress={() => simulateVolumeButton('down')}
//           accessibilityLabel="Switch to numbers mode"
//         >
//           <Text style={styles.volumeButtonText}>Vol - (Numbers)</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//     flexDirection: 'row',
//   },
//   modeIndicator: {
//     position: 'absolute',
//     top: 10,
//     alignSelf: 'center',
//     zIndex: 10,
//   },
//   modeText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   leftDotsContainer: {
//     width: '20%',
//     justifyContent: 'space-evenly',
//     alignItems: 'center',
//     paddingVertical: 20,
//   },
//   rightDotsContainer: {
//     width: '20%',
//     justifyContent: 'space-evenly',
//     alignItems: 'center',
//     paddingVertical: 20,
//   },
//   displayContainer: {
//     width: '60%',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   dot: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: '#0052cc',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginVertical: 10,
//     elevation: 5,
//   },
//   activeDot: {
//     backgroundColor: '#003380',
//     transform: [{ scale: 1.1 }],
//   },
//   dotText: {
//     color: 'white',
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   displayText: {
//     fontSize: 72,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 20,
//   },
//   typedText: {
//     fontSize: 24,
//     color: '#333',
//     marginTop: 20,
//     textAlign: 'center',
//     width: '80%',
//   },
//   spaceButton: {
//     padding: 15,
//     borderRadius: 15,
//     backgroundColor: '#e0e0e0',
//     marginTop: 10,
//   },
//   spaceButtonText: {
//     fontSize: 18,
//     color: '#333',
//   },
//   submitButton: {
//     padding: 15,
//     borderRadius: 15,
//     backgroundColor: '#4CAF50',
//     marginTop: 20,
//   },
//   submitButtonText: {
//     fontSize: 18,
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   volumeSimulation: {
//     position: 'absolute',
//     bottom: 10,
//     left: 0,
//     right: 0,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     zIndex: 10,
//   },
//   volumeButton: {
//     padding: 10,
//     backgroundColor: '#ddd',
//     borderRadius: 5,
//     marginHorizontal: 5,
//   },
//   volumeButtonText: {
//     fontSize: 12,
//   },
// });

// export default BrailleKeyboard;