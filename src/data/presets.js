/* Ideal speaking speed (words per minute) for different situations */
export const PRESETS = [
  { id: "class", name: "Class presentation", min: 120, max: 160 },
  { id: "pitch", name: "Pitch or interview", min: 130, max: 170 },
  { id: "viva", name: "Viva or thesis defence", min: 110, max: 150 },
  { id: "speech", name: "Public speech", min: 100, max: 140 },
];
export const LANGS = [["en-IN", "English (India)"], ["en-US", "English (US)"], ["en-GB", "English (UK)"]];

export const FILLERS = {
  single: ["um", "uh", "uhm", "umm", "er", "erm", "hmm", "basically", "actually", "literally", "honestly"],
  multi: ["you know", "i mean", "sort of", "kind of", "you see", "okay so", "so yeah"],
  likePrev: ["was", "is", "it's", "just", "and", "so", "but", "um", "uh", "are", "were", "very", "really", "be", "been", "that's"],
};
export const HEDGE_RE = /\b(maybe|perhaps|probably|i think|i guess|i suppose|not sure)\b/g;
export const STOP = new Set("about above after again against because before being below between could during each from further have having here itself just more most other over same should since some such than that their them then there these they this those through under until very want were what when where which while with would your yours into only also will been does doing done made make many much must our out own say said too use used its it's".split(" "));
