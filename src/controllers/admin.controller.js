import User from "../models/User.js";
import Package from "../models/Package.js";
import Booking from "../models/Booking.js";
import Inquiry from "../models/Inquiry.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const [
      userCount,
      adminCount,
      totalPackages,
      totalInquiries,
      totalBookings,
      totalRevenue,
      bookingsByPackage,
      monthlyBookings
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: "admin" }),
      Package.countDocuments({}),
      Inquiry.countDocuments({}),
      Booking.countDocuments({}),
      Booking.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$paidAmount" } } }
      ]),

      Booking.aggregate([
        {
          $group: {
            _id: "$package",
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "packages",
            localField: "_id",
            foreignField: "_id",
            as: "package"
          }
        },
        { $unwind: "$package" },
        {
          $project: {
            _id: 0,
            packageTitle: "$package.title",
            count: 1
          }
        }
      ]),
      Booking.aggregate([
        {
          $group: {
            _id: { $month: "$bookedAt" },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            month: "$_id",
            count: 1,
            _id: 0
          }
        },
        { $sort: { month: 1 } }
      ])
    ]);

    res.status(200).json({
      users: {
        total: userCount,
        admins: adminCount,
        normalUsers: userCount - adminCount
      },
      packages: {
        total: totalPackages
      },
      inquiries: {
        total: totalInquiries
      },
      bookings: {
        total: totalBookings,
        revenue: totalRevenue[0]?.total || 0,
        byPackage: bookingsByPackage,
        byMonth: monthlyBookings
      }
    });

  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({ message: "Server error while generating dashboard summary" });
  }
};
