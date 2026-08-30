const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
    {
        ticketNumber: {
            type: String,
            required: true,
            unique: true
        },

        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        assignedAgent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        subject: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            enum: [
                "Billing",
                "Technical",
                "Account",
                "Order",
                "Delivery",
                "Other"
            ],
            default: "Other"
        },

        priority: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium"
        },

        aiSuggestion: {
            category: {
                type: String,
                default: null
            },

            priority: {
                type: String,
                default: null
            },

            summary: {
                type: String,
                default: null
            }
        },

        status: {
            type: String,
            enum: [
                "New",
                "Assigned",
                "In Progress",
                "Resolved"
            ],
            default: "New"
        },

        resolutionNote: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Ticket", ticketSchema);