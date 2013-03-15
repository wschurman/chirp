// Hide the alert box.
function hideAlert() {
  $('#result').css("display", "none");
}

// Switch the user.
function changeUser() {
  initChain($('input#txtusername').val());
}
