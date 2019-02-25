const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const versionSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        default: ''
    }
}, {
    timestamps: true
});


const projectSchema = new mongoose.Schema({
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
    }]
}, {
    timestamps: true
});


module.exports = mongoose.model('Project', projectSchema);