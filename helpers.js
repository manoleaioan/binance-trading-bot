module.exports = {
  percentageChange(arr) {
    var pctchanges = [1];
    for (i = 1; i <= arr.length - 1; i++) {
      var percentage = ((arr[i] - arr[i - 1]) / arr[i - 1]) + 1;
      pctchanges.push(percentage);
    }
    return pctchanges;
  },

  cumulativeProduct(arr){
    var prod = 1;
  
    for (i = 1; i <= arr.length - 1; i++) {
      prod = arr[i] * prod;
    }
    return prod - 1;
  }
}