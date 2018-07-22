const mongoose = require("mongoose");

const schema  = mongoose.Schema;

const claimSchema = new Schema({
    Homeowner    :{ type: schema.Types.ObjectId, ref: 'User' },
    Policyholder : string,
    Address      : string,
    Dol          : string,
    TypeofLoss   : string,
    Insurance    : string,
    Deductible   : string,
    urlImage     : string,

});


const claim = mongoose.model('claim', claimSchema);
module.exports = claim;