const path = require('path');
const { catchAsync } = require('../helpers/catchAsync');



const renderIndex = catchAsync(async (req, res, next) => {

  res.status(200).render('emails/baseEmail', {});
});

module.exports = { renderIndex };