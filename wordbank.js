/**
 * The Restricted Speaker — Indian Word Bank & Categories
 * 12 desi-themed categories with culturally rich words.
 * Export signatures unchanged — drop-in replacement.
 */
export const CATEGORIES = {
  "Indian Daily Life": [
    "Colony Gate", "Bijli Cut", "Pani Tanki", "Kirana Shop", "Chaiwala",
    "Jugaad", "Auto Rickshaw", "Pressure Cooker", "Bijli Bill", "Cable TV",
    "Water Tanker", "Courier Boy", "Society Meeting", "Balcony Gossip", "Broken Road",
    "Street Dog", "Cow Traffic", "Power Cut", "Rain Puddle", "Sabzi Mandi"
  ],

  "School Life": [
    "Last Bench", "PT Period", "Proxy Attendance", "Tiffin Sharing", "Viva Panic",
    "Annual Function", "Teacher Ki Nazar", "Report Card", "Library Period", "School Bus",
    "Chalk Fight", "Parent Meeting", "Homework Copy", "Mobile Chhupana", "Exam Leak"
  ],

  "College & Hostel": [
    "Attendance Shortage", "Canteen Adda", "Fresher Ragging", "Back Paper",
    "Group Project", "Placement Season", "Hostel Warden", "Night Canteen",
    "Bike Parking War", "College Fest", "Assignment Deadline", "CGPA Tension",
    "Internship Hunt", "Hostel Room Party", "Jugaad Notes"
  ],

  "Indian Family": [
    "Shaadi Season", "Relative Visit", "TV Remote Fight", "Rishta Pressure",
    "Mom Ki Chappal", "Strict Papa", "Nosy Neighbor", "Chore Escape",
    "Guest Arrival", "Tiffin Lecture", "Result Day", "Career Advice",
    "Joint Family Drama", "Dowry Discussion", "Family WhatsApp Group"
  ],

  "Indian Festivals": [
    "Holi Rang", "Diwali Patakha", "Eid Biryani", "Navratri Garba",
    "Ganesh Visarjan", "Rakhi Tying", "Janmashtami Jhula", "Durga Puja Pandal",
    "Lohri Bonfire", "Makar Sankranti Patang", "Onam Sadhya", "Baisakhi Bhangra",
    "Chhath Puja", "Karwa Chauth", "Christmas Carol"
  ],

  "Indian Street Food": [
    "Pani Puri Wala", "Chole Bhature", "Vada Pav", "Dosa Counter",
    "Pan Shop", "Juice Corner", "Pav Bhaji", "Aloo Tikki", "Jalebi",
    "Chai Tapri", "Samosa", "Maggi Wala", "Momos Stall", "Chaat Corner", "Sugarcane Juice"
  ],

  "Cricket & Gully Games": [
    "Gully Cricket", "Tapeball", "Kabbadi", "Kho Kho", "Lagori",
    "Kite Flying", "Pittu Garam", "Gilli Danda", "Marbles", "Carrom",
    "Ludo", "Arm Wrestling", "Pehlwani", "Sack Race", "Chain Chain"
  ],

  "Viral Indian Scenarios": [
    "Mom Is Coming", "Window Toot Gaya", "Light Chali Gayi", "Pani Khatam",
    "Teacher Inspection", "Wedding Dance", "Barish Mein Flood", "Relatives Aye",
    "Hostel Night Raid", "Traffic Jam", "Bijli Gaya", "Exam Leak",
    "Padhlo Beta", "Neighbour Ki Shikayat", "Society Notice"
  ],

  "Indian Transport": [
    "Sleeper Class", "General Dabba", "Auto Meter Down", "Local Train",
    "Metro Rush", "Jugaad Vehicle", "Tempo Traveller", "Rickshaw Bargain",
    "BEST Bus", "DTC Bus", "Scooty", "Bullet Train Dream",
    "Ambulance Jam", "Tractor Road", "Government Bus"
  ],

  "Bollywood & Memes": [
    "Bhai Scene", "Interval Break", "Item Number", "Love Story",
    "Villain Entry", "Comedy Scene", "Action Climax", "Tragic Death",
    "Twist Ending", "Background Music", "Slow Motion", "Dialogue Baazi",
    "Remake Film", "OTT Release", "Trailer Mein Sab"
  ],

  "Indian Horror-Comedy": [
    "Haunted Haveli", "Village Baba", "Fake Tantrik", "Power Cut Ghost",
    "Midnight Train", "Haunted School", "Chudail Ka Darr", "Peepal Tree",
    "Graveyard Walk", "Bhoot Bungalow", "Burning Diya", "Crying Baby Night",
    "Footstep Sound", "Old Photo Frame", "Strange Smell"
  ],

  "Indian Wedding Chaos": [
    "Baraat Dance", "Joota Chori", "Food Rush", "DJ Night",
    "Relative Aunty", "Dulha Missing", "Sangeet Practice", "Mehndi Night",
    "Photographer Chase", "Flower Decoration", "Wedding Cake Cut",
    "Shaadi Buffet", "Haldi Ceremony", "Vidaai Crying", "Ring Ceremony"
  ],

  "TV & Cartoons": ["Jethalal","Bhide","Babita Ji","Taarak Mehta","Nobita","Shizuka","Doraemon","Shin Chan","Motu Patlu","Chhota Bheem","Bal Ganesh","Krish","Shaktimaan","Rudra","Captain Tsubasa","Ninja Hattori","Chacha Chaudhary","Suppandi","Nagraj","Doga"],

  "JEE/NEET Trauma": ["Drop year","Allen coaching","Mock test","Percentile","Revision notes","Kota factory","Doubt session","PYQ","Rank predictor","Cut-off","OMR sheet","Inorganic chemistry","Physics wallah","Test series","NTA glitch","Air 1","Coaching fee","Hostel warden","Night study","Board percentage"],

  "Delhi Slang": ["Bhai sun","Teri toh","Kya scene hai","Setting karna","Jugaad","Yaar sach mein","Full on","Patao","Ghanta","Bindaas","Bak bak","Mast hai","Chill maar","Sahi baat","Khatarnak","Dilli wala","Pakka","Scene ban gaya","Jhakaas","Ekdum mast"],

  "Hostel Moments": ["Midnight Maggi","Proxy attendance","WiFi password","Mess food","Laundry pile","Room inspection","Night canteen","Extension cord","Bunk lecture","Roommate snoring","Power cut","Exam night","Hostel gate","Warden knock","Group study","Borrowed notes","Morning chai","Shared rickshaw","Result day","Farewell"],

  "Indian Parents": ["Sharma ji ka beta","Log kya kahenge","Doctor ya engineer","Ghar ka khana","Curfew","Pocket money","Board exams","Relatives visit","Report card","Arranged marriage","Sanskaar","Early morning","Mobile band karo","Padhai karo","Rishta","Tuition","Career pressure","Beta settle ho ja","Gold medal","IIT IIM"]
};

/**
 * Returns a random word from the specified category, ensuring it wasn't used yet if possible.
 */
export function getRandomWord(category, customWords = null, usedWords = []) {
  let list = [];

  if (customWords && customWords.length > 0) {
    list = customWords;
  } else if (CATEGORIES[category]) {
    list = CATEGORIES[category];
  } else {
    // Fallback: merge all standard words
    list = Object.values(CATEGORIES).flat();
  }

  // Filter out already used words
  let available = list.filter(w => !usedWords.includes(w.toLowerCase()));

  // If all words are used, reset
  if (available.length === 0) {
    available = list;
  }

  const randIndex = Math.floor(Math.random() * available.length);
  return available[randIndex];
}

/**
 * Gets a random category from the selected list of categories.
 */
export function getRandomCategory(selectedCategories) {
  if (!selectedCategories || selectedCategories.length === 0) {
    selectedCategories = Object.keys(CATEGORIES);
  }
  const randIndex = Math.floor(Math.random() * selectedCategories.length);
  return selectedCategories[randIndex];
}

/**
 * Parses uploaded text file of custom words.
 * Expects one word per line.
 */
export function parseCustomWords(fileText) {
  if (!fileText) return [];
  return fileText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith("#"));
}
