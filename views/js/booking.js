const checkinDate = document.getElementById("checkin-date");
const checkoutDate = document.getElementById("checkout-date");

checkinDate.addEventListener("input", function () {
  checkoutDate.min = this.value;
  if (Date.parse(checkoutDate.value) < Date.parse(this.value)) {
    checkoutDate.value = this.value;
  }
});

checkoutDate.addEventListener("input", function () {
  if (Date.parse(checkoutDate.value) < Date.parse(checkinDate.value)) {
    checkoutDate.value = checkinDate.value;
  }
});
