const User =  require("../models/user")
const Message =  require("../models/message")
const mongoose = require('mongoose')

const searchContacts = async (req, res, next) => {
  try {
    const searchText = req.params.searchText  
    if(!searchText) throw {message: 'Search text is required', status: 400}
    const sanitizedText = searchText.replace(/[^a-zA-Z0-9\s]/g, '') 
    const regex = new RegExp(sanitizedText, 'i')
    const contacts = await User.find(
      {
        $and: [
          {_id: {$ne: req.userId}},
          {
            $or: [{name: regex},{email: regex}]
          }
        ],
      }
    )
    if(contacts.length <= 0) return {message: 'Contacts not found', status: 404}
    return res.status(200).json({contacts})
  } catch (error) {
    return res.status(error.status).json({message: error.message || `Error searching contacts`, details: error.details || {}});
  }
}

const getDmContacts = async (req, res, next) => {
  try {
    let userId = req.userId  
    if(!userId) throw {message: 'Could not load DMs', status: 400, details: {missingParams: 'User id is required'}}
    userId = new mongoose.Types.ObjectId(userId)
    
    const dms = await Message.aggregate([
      {$match: {$or: [{sender: userId}, {receiver: userId}]}},
      {$sort: {timestamp: -1}},
      {$group: {
        _id: {
          $cond: {
            if: {$eq: ["$sender", userId]},
            then: "$receiver",
            else: "$sender"
          }
        },
        lastMessageTime: {$first: '$timestamp'}
      }},
      {$lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'contactInfo'
      }},
      {$unwind: '$contactInfo'},
      {$project: {
        _id: 1,
        lastMessageTime: 1,
        name: '$contactInfo.name',
        email: '$contactInfo.email',
        image: '$contactInfo.image',
        color: '$contactInfo.color'
      }},
      {$sort: {lastMessageTime: -1}}
    ])

    if(dms.length <= 0) throw {message: 'Could not load DMs', status: 400, details: {missingParams: 'Your chat list is empty'}}
    return res.status(200).json({dms})
  } catch (error) {
    return res.status(error.status || 500).json({message: error.message || `Error searching contacts`, details: error.details || {}});
  }
}

const getAllContacts = async (req, res, next) => {
  try {
    const userId = req.userId  
    if(!userId) throw {message: `You're not authorized`, status: 400, details: {missingParams: 'User not logged in'}}
    const contacts = await User.find({_id: {$ne: new mongoose.Types.ObjectId(userId)}})
    return res.status(200).json({contacts})
  } catch (error) {
    return res.status(error.status || 500).json({message: error.message || `Error searching contacts`, details: error.details || {}});
  }
}

module.exports = {searchContacts, getDmContacts, getAllContacts}

  // // i is for case insensitive search
  // const contacts = await User.find({name: {$regex: sanitizedText, $options: 'i'}}) // matches any string that contains searchText
  // // name: { $regex: `^${searchText}`, $options: 'i' }  // matches any string that starts with searchText