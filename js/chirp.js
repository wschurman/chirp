// Handles automated generation and checking of Tweets.
// Requires jQuery.

// Whether the current iteration is switched.
var switched = false;
var correct = 0, iterations = 0;

var chain = {}, hashtags = new Array();
var tweet_data = new Array();

// Initialize the Markov chain.
function initChain() {
  // Need the 'callback=?' part to force a JSONP call.
  var url = 'http://api.twitter.com/1/statuses/user_timeline.json?callback=?'
    + '&screen_name=' + username;

  // Read tweets from Twitter.
  $.ajax({
    url: url,
    dataType: 'json',
    async: false,
    success: function(data) {
      tweet_data = data.map(function (x) { return x.text });
      buildChain(tweet_data);
    }
  });

  // Build the Markov chain.
  function buildChain(tweets) {
    var word1 = "\n", word2 = "\n";
    for (var i = 0; i < tweets.length; i++) {
      var words = tweets[i].split(" ");
      for (var j = 0; j < words.length; j++) {
        if (words[j] != "") {
          if (words[j].charAt(0) == '#') {
            hashtags.push(words[j]);
          } else {
            var key = word1 + "^" + word2;
            if (key in chain) {
              chain[key].push(words[j]);
            } else {
              chain[key] = [words[j]];
            }
            word1 = word2;
            word2 = words[j];
          }
        }
      }
    }
    populateTweets();
  }
}

// Generate tweets using a Markov chain.
function generateTweet() {
  var max_words = 10;

  var sentence = "";
  var w1, w2;
  // Pick a random starting key from the chain.
  var get_rand_key = (function(dict) {
    var result = 0;
    var count = 0;
    for (var prop in dict) {
      if (Math.random() < 1/++count) {
        result = prop;
      }
    }
    var result_arr = result.split("^");
    w1 = result_arr[0];
    w2 = result_arr[1];
  });

  get_rand_key(chain);

  for (var i = 0; i < max_words; i++) {
    var curr_chain = chain[w1 + "^" + w2];
    if (curr_chain === undefined) {
      get_rand_key(chain);
      continue;
    }
    var new_word = curr_chain[Math.floor(Math.random() * curr_chain.length)];
    sentence += " " + new_word;
    w1 = w2;
    w2 = new_word;
  }

  // Add random hashtags at the end.
  for (var i = 0; i <= Math.floor(Math.random() * 3) + 1; i++) {
    sentence += hashtags[Math.floor(Math.random() * hashtags.length)] + " ";
  }

  return sentence;
}

// Read the tweets from Twitter and populate the page.
function populateTweets() {
  var real_tweet = tweet_data[Math.floor(Math.random() * tweet_data.length)];
  var fake_tweet = generateTweet();
  if (Math.random() <= 0.5) {
    switched = true;
    var tmp = real_tweet;
    real_tweet = fake_tweet;
    fake_tweet = tmp;
    //[real_tweet, fake_tweet] = [fake_tweet, real_tweet];
  } else {
    switched = false;
  }
  $('#tweet-left').text(real_tweet);
  $('#tweet-right').text(fake_tweet);
  iterations++;
}

// Process the user guess.
function guess(side) {
  var result = "", alert_type = "";
  if ((side == 0 && !switched) || (side == 1 && switched)) {
    correct++;
    result = "Correct! ";
    alert_type = "alert-success";
    $('#result .text').text("Your answer was correct!");
  } else {
    result = "Wrong. ";
    alert_type = "alert-error";
    $('#result .text').text("Your answer was wrong. :(");
  }
  result += correct + " / " + iterations;
  $('#score').text(result);
  $('#result').attr("class", "alert " + alert_type);
  $('#result').css("display", "block");
  populateTweets();
}

initChain();
