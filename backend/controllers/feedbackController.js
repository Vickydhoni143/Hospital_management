import Feedback from '../models/Feedback.js';

// @desc    Submit feedback
// @route   POST /api/feedback/submit
// @access  Public
export const submitFeedback = async (req, res) => {
  try {
    const { name, email, rating, comment, role } = req.body;

    const feedback = new Feedback({
      name,
      email: email || '',
      rating,
      comment,
      role: role || 'visitor'
    });

    await feedback.save();

    res.status(201).json({
      status: 'success',
      message: 'Thank you for your feedback! It will be reviewed before publishing.',
      data: {
        feedback: {
          id: feedback._id,
          name: feedback.name,
          email: feedback.email,
          rating: feedback.rating,
          comment: feedback.comment,
          role: feedback.role,
          approved: feedback.approved,
          createdAt: feedback.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit feedback'
    });
  }
};

// @desc    Get all approved feedbacks
// @route   GET /api/feedback/approved
// @access  Public
export const getApprovedFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ approved: true })
      .sort({ approvedAt: -1 })
      .limit(10);

    const formattedFeedbacks = feedbacks.map(feedback => ({
      _id: feedback._id,
      id: feedback._id,
      name: feedback.name,
      email: feedback.email,
      rating: feedback.rating,
      comment: feedback.comment,
      role: feedback.role,
      approved: feedback.approved,
      createdAt: feedback.createdAt,
      approvedAt: feedback.approvedAt
    }));

    res.status(200).json({
      status: 'success',
      data: {
        feedbacks: formattedFeedbacks
      }
    });
  } catch (error) {
    console.error('Get approved feedbacks error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch feedbacks'
    });
  }
};

// @desc    Get all feedbacks (for admin)
// @route   GET /api/feedback/all
// @access  Private (Admin only)
export const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });

    const formattedFeedbacks = feedbacks.map(feedback => ({
      _id: feedback._id,
      id: feedback._id,
      name: feedback.name,
      email: feedback.email,
      rating: feedback.rating,
      comment: feedback.comment,
      role: feedback.role,
      approved: feedback.approved,
      createdAt: feedback.createdAt,
      approvedAt: feedback.approvedAt
    }));

    res.status(200).json({
      status: 'success',
      data: {
        feedbacks: formattedFeedbacks
      }
    });
  } catch (error) {
    console.error('Get all feedbacks error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch all feedbacks'
    });
  }
};

// @desc    Approve feedback
// @route   PATCH /api/feedback/approve/:id
// @access  Private (Admin only)
export const approveFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { 
        approved: true,
        approvedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({
        status: 'error',
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Feedback approved successfully',
      data: {
        feedback: {
          id: feedback._id,
          name: feedback.name,
          email: feedback.email,
          rating: feedback.rating,
          comment: feedback.comment,
          role: feedback.role,
          approved: feedback.approved,
          approvedAt: feedback.approvedAt
        }
      }
    });
  } catch (error) {
    console.error('Approve feedback error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to approve feedback'
    });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/delete/:id
// @access  Private (Admin only)
export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByIdAndDelete(id);

    if (!feedback) {
      return res.status(404).json({
        status: 'error',
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Feedback deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete feedback'
    });
  }
};

// @desc    Get feedback statistics
// @route   GET /api/feedback/stats
// @access  Private (Admin only)
export const getFeedbackStats = async (req, res) => {
  try {
    const totalFeedbacks = await Feedback.countDocuments();
    const approvedFeedbacks = await Feedback.countDocuments({ approved: true });
    const pendingFeedbacks = await Feedback.countDocuments({ approved: false });
    
    const ratingStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const roleStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          total: totalFeedbacks,
          approved: approvedFeedbacks,
          pending: pendingFeedbacks,
          ratingDistribution: ratingStats,
          roleDistribution: roleStats
        }
      }
    });
  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch feedback statistics'
    });
  }
};