import leoProfanity from 'leo-profanity';

leoProfanity.loadDictionary('ru');
leoProfanity.add(leoProfanity.getDictionary('en')); 
const filterProfanity = (text) => leoProfanity.clean(text);

export default filterProfanity;
