const updateVoteQuantity = (numberOfRatings) => {
  const voteContainer = document.querySelector("h3 span");
  voteContainer.innerHTML = numberOfRatings;
};

const getRatingsData = () => {
  firebase
    .firestore()
    .collection("userRatings")
    .onSnapshot((query) => {
      updateVoteQuantity(query.docs.length);
      setRatingAverage(query);
    });
};

getRatingsData();

const setRatingData = (inputUser) => {
  firebase
    .firestore()
    .collection("userRatings")
    .add({
      punctuation: +inputUser,
    });
};

const setPermisionToVote = (value) => {
  window.localStorage.setItem("hasVoted", value);
};

setPermisionToVote(false);

const verifyPermisionUser = () => {
  return window.localStorage.getItem("hasVoted") === "true";
};

const countDecimals = function (value) {
  if (Math.floor(value) === value) return 0;
  return value.toString().split(".")[1]?.length || 0;
};

const setRatingAverage = (rating) => {
  let totalSum = 0;
  rating.forEach((a) => (totalSum += a.data().punctuation));
  let average = (totalSum / rating.docs.length).toFixed(2);
  document.querySelector("#punctuation").innerText =
    average === "NaN" ? 0 : average;
  document.querySelector(".fill-ratings").style.width = `${average * 20}%`;
};

const getImgCase = (rating) => {
  if (rating < 0) return "negativeNumber";
  if (rating > 5) return "moreThan5";
  if (countDecimals(rating) > 2) return "moreThan2Decimals";
  if (rating >= 4.5) return "veryGood";
  if (rating >= 3.5) return "good";
  if (rating >= 2.5) return "average";
  if (rating > 1) return "notSoGood";
  if (rating <= 1) return "absolutelyBad";
};

const ratingCases = {
  moreThan2Decimals: {
    message: "Thanks! But did you really need that many decimals?",
    img: "images/grumpyThinker.png",
  },
  moreThan5: {
    message: "I didn't know I was that awesome! But only 1 to 5 stars allowed!",
    img: "images/smartFrog.png",
  },
  veryGood: {
    message: "Wow thank you! I really appreciate it!",
    img: "images/hug.png",
  },
  good: {
    message: "Thank you!",
    img: "images/happy.png",
  },
  average: {
    message: "Thanks! Will try to get better!",
    img: "images/angelFace.png",
  },
  notSoGood: {
    message: "I'm sorry, hope it's better next time!",
    img: "images/epicThinker.png",
  },
  absolutelyBad: {
    message: "Omg, I'm really sorry :(",
    img: "images/grumpyThinker.png",
  },
  negativeNumber: {
    message:
      "Come on! It couldn't have been that bad! Only 1 to 5 stars allowed!",
    img: "images/ghost.png",
  },
  notSoClever: {
    message: "Not so clever! You can only vote once :)",
    img: "images/smartFrog.png",
  },
};

const showImg = (ratingCase) => {
  document.querySelector(".reactionImg").style.display = "block";
  document.querySelector(".reactionImg").src = ratingCases[ratingCase].img;
  document.querySelector(".img-message").style.display = "block";
  document.querySelector(".img-message").innerText =
    ratingCases[ratingCase].message;
};

const reactToRating = (rating) => {
  const imgCase = getImgCase(rating);
  showImg(imgCase);
};

const makeInputRed = () =>
  document.querySelector("input").classList.add("wrong-rating");

const makeInputGray = () =>
  document.querySelector("input").classList.remove("wrong-rating");

const isRatingValid = (rating) => {
  if (rating >= 0 && rating <= 5) {
    makeInputGray();
    return true;
  }

  makeInputRed();
  return false;
};

document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const inputUser = e.target.elements.inputPunctuation;
  reactToRating(inputUser.value);
  if (verifyPermisionUser()) {
    inputUser.value = "";
    return showImg("notSoClever");
  }
  if (isRatingValid(inputUser.value)) {
    setRatingData(inputUser.value);
    getRatingsData();
    setPermisionToVote(true);
  }
  inputUser.value = "";
});
