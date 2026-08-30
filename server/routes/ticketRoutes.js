const express = require("express");

const Ticket = require("../models/Ticket");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { analyzeTicket } = require("../services/aiService");
const router = express.Router();


const allowedCategories = [
    "Billing",
    "Technical",
    "Account",
    "Order",
    "Delivery",
    "Other"
];

const allowedPriorities = [
    "Low",
    "Medium",
    "High"
];

const validateAISuggestion = (aiResult) => {
    if (!aiResult || typeof aiResult !== "object") {
        return false;
    }

    if (!allowedCategories.includes(aiResult.category)) {
        return false;
    }

    if (!allowedPriorities.includes(aiResult.priority)) {
        return false;
    }

    if (
        !aiResult.summary ||
        typeof aiResult.summary !== "string"
    ) {
        return false;
    }

    return true;
};

// Create Ticket
router.post(
    "/",
    protect,
    authorize("customer"),
    async (req, res) => {
        try {
            const {
                subject,
                description,
                category
            } = req.body;

            // Validate required fields
            if (!subject || !description) {
                return res.status(400).json({
                    success: false,
                    message: "Subject and description are required."
                });
            }

            // AI ticket analysis
            // AI ticket analysis
let aiSuggestion = {
    category: null,
    priority: null,
    summary: null
};

try {
    const aiResult = await analyzeTicket(
        subject,
        description
    );

    if (validateAISuggestion(aiResult)) {
        aiSuggestion = {
            category: aiResult.category,
            priority: aiResult.priority,
            summary: aiResult.summary
        };

        console.log("Valid AI suggestion:", aiSuggestion);
    } else {
        console.log("Invalid AI suggestion received.");
    }
} catch (error) {
    console.error(
        "AI analysis failed:",
        error.message
    );
}

            // Generate unique ticket number
            const ticketNumber = `TKT-${Date.now()}`;

            // Create ticket
            const ticket = await Ticket.create({
    ticketNumber,
    customer: req.user.userId,
    subject,
    description,
    category: category || aiSuggestion.category || "Other",

    priority: aiSuggestion.priority || "Medium",

    aiSuggestion: {
        category: aiSuggestion.category,
        priority: aiSuggestion.priority,
        summary: aiSuggestion.summary
    }
});

            res.status(201).json({
                success: true,
                message: "Ticket created successfully.",
                ticket
            });
        } catch (error) {
            console.error("Create ticket error:", error.message);

            res.status(500).json({
                success: false,
                message: "Server error while creating ticket."
            });
        }
    }
);

// Get customer's own tickets
router.get(
    "/my",
    protect,
    authorize("customer"),
    async (req, res) => {
        try {
            const tickets = await Ticket.find({
                customer: req.user.userId
            })
                .sort({ createdAt: -1 })
                .populate("assignedAgent", "name email");

            res.status(200).json({
                success: true,
                count: tickets.length,
                tickets
            });
        } catch (error) {
            console.error("Get my tickets error:", error.message);

            res.status(500).json({
                success: false,
                message: "Server error while fetching tickets."
            });
        }
    }
);


// Get single customer's ticket
router.get(
    "/:id",
    protect,
    authorize("customer"),
    async (req, res) => {
        try {
            const ticket = await Ticket.findOne({
                _id: req.params.id,
                customer: req.user.userId
            }).populate(
                "assignedAgent",
                "name email"
            );

            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    message: "Ticket not found."
                });
            }

            res.status(200).json({
                success: true,
                ticket
            });
        } catch (error) {
            console.error(
                "Get ticket error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message: "Server error while fetching ticket."
            });
        }
    }
);

module.exports = router;