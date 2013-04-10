exports.currentPageName = function(req, res) {
    return applyFancyFormatting(req.url);
}
exports.luckyNumber = function() {
   return Math.floor(Math.random() * 100);
}