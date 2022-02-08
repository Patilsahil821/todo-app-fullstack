module.exports = getDay

function getDay() {
  var options = {
    weekday: "long"
  }
  var date = new Date()
  var today = date.toLocaleDateString("en-us", options)
  return today
}
