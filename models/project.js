const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const versionSchema = new Schema({
    content: {
        type: String,
        required: true,
        default: ''
    },
    approved: Boolean
}, {
    timestamps: true
});


const projectSchema = new Schema({
    name: {
        type: String,
        required: true,
        default: ''
    },
    users: [{
        type: Schema.Types.ObjectId, 
        ref: 'User'
    }],
    versions: [versionSchema],
    pendingVersion: versionSchema,
    approvals: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
}, {
    timestamps: true
});

projectSchema.methods.getCurrentVersion = function() {
        // The 'this' keyword is this project document
        // Find and return the current version

        //grab all versions
        return this.versions
        //sort them in reverse chronological order
        .sort(function(a, b){
            return b.updatedAt - a.updatedAt;
        })
        //find the latest one that is approved
        .find(function(version){
            return version.approved === true;
        });
  } 
  
module.exports = mongoose.model('Project', projectSchema);
