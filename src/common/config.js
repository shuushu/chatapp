export const fbConfig = {
  apiKey: "AIzaSyBwc5tkZM3fEQcyPC1-HfguTbIt8woO9iA",
  authDomain: "shushu-cb26c.firebaseapp.com",
  databaseURL: "https://shushu-cb26c.firebaseio.com",
  storageBucket: "shushu-cb26c.appspot.com"
};
/*import algoliasearch from "algoliasearch";
const algolia = algoliasearch(
  'IR4NMVE7DJ',
  '55d298ae2187ff5f27bebdf3db895a85'
);


export const index = algolia.initIndex('books');*/

// 상태값
export const TYPE = [
  'INIT',
  'LOGIN_EMAIL',
  'LOGIN_GOOGLE_AUTH',
  'CREATE_AUTH',
  'GET_MEMBER',
  'GET_ROOMLIST',
  'GET_MESSAGE',
  'GET_OLD_MESSAGE',
  'SET_JOIN',
  'SEND_MESSAGE',
  'DELETE_ROOM'
];
