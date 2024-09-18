const express = require("express");
const router = express.Router();

const { jwtAuthMiddleware } = require("../jwt");
const Candidate = require("../models/candidate");
const User = require("../models/user");

const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID);

    if (user.role === "admin") {
      return true;
    }
  } catch (err) {
    return false;
  }
};

//Post route to add a candidate
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ msg: "User does not have admin role" });

    const data = req.body; //assuming the request body contains the Candidate data

    //create anew Candidate document using the Mongoose model
    const newCandidate = new Candidate(data);

    //save the new user to the database
    const response = await newCandidate.save();

    return res.status(200).json({ response: response });
  } catch (err) {
    return res.status(404).json({ err: "Internal server error" });
  }
});

//To update the password
router.put("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id)) {
      return res.status(404).json({ msg: "User has not admin role" });
    }
    const candidateId = req.params.candidateID; //Extraxt the id from the URL parameter
    const updateCandidateData = req.body; //Extract the old password and current password

    const response = await Candidate.findByIdAndUpdate(
      candidateId,
      updateCandidateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!response) {
      return res.status.apply(400).json({ error: "Candiadte not found" });
    }
    console.log("candidate data updated");
    res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({ Error: "Internal server Error" });
  }
});

//To update the password
router.delete("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id)) {
      return res.status(403).json({ msg: "User does not have admin role" });
    }
    const candidateId = req.params.candidateID; //Extraxt the id from the URL parameter

    const response = await Candidate.findByIdAndDelete(candidateId);

    if (!response) {
      return res.status.apply(400).json({ error: "Candiadte not found" });
    }

    res.status(200).json({ msg: "Deleted successfuly" });
  } catch (err) {
    return res.status(500).json({ Error: "Internal server Error" });
  }
});

//let's statrt Voting
router.get("/vote/:candidateId", jwtAuthMiddleware, async (req, res) => {
  //admin can't vote
  // user can only vote once
  candidateId = req.params.candidateId;
  userId = req.user.id;
  try {
    //find the candidate document with the specified candidateId
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) return res.status(404).json({ msg: "candidate not found" });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.isVoted) {
      return res.status(400).json({ msg: "You have already voted" });
    }

    if (user.role == "admin")
      return res.status(403).json({ msg: "Admin can't vote" });

    //update the candidate document to record the vote
    candidate.votes.push({ user: userId });
    candidate.voteCount++;
    await candidate.save();

    //Update the user document
    user.isVoted == true;
    await user.save();

    return res.status(200).json({ msg: "Vote recorded successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Internal server Error" });
  }
});

//Vote count
router.get("/vote/count", async (req, res) => {
  try {
    //Find all candidates and sort them by voteCount in descending order
    const candidate = await Candidate.find().sort({ voteCount: "desc" });

    //Map the candidate to only return their name and voteCount
    const voteRecord = candidate.map((data) => {
      return {
        party: data.party,
        count: data.voteCount,
      };
    });
    return res.status(200).json(voteRecord);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Internal server Error" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const candidate = await Candidate.find({}, "name party -_id");
    return res.status(200).json(candidate);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Internal server Error" });
  }
});
module.exports = router;
