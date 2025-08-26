import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiconnector";
import rzpLogo from "../../assets/Logo/rzp_logo.png";
import { setPaymentLoading } from "../../slices/courseSlice";
import { resetCart } from "../../slices/cartSlice";

const {
  COURSE_PAYMENT_API,
  COURSE_VERIFY_API,
  SEND_PAYMENT_SUCCESS_EMAIL_API,
} = studentEndpoints;

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;

    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export async function buyCourse(
  token,
  courses,
  userDetails,
  navigate,
  dispatch
) {
  const toastId = toast.loading("Loading...");
  try {
    //load the script
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      toast.error("RazorPay SDK failed to load");
      return;
    }

    //initiate the order
    const orderResponse = await apiConnector(
      "POST",
      COURSE_PAYMENT_API,
      { courses },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!orderResponse.data.success) {
      throw new Error(orderResponse.data.message);
    }
    // console.log("PRINTING orderResponse", orderResponse);
    //options
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY,
      amount: `${orderResponse.data.data.amount}`,
      currency: orderResponse.data.data.currency,
      name: "StudyNotion",
      description: "Thank You for Purchasing the Course",
      order_id: orderResponse.data.data.id,
      prefill: {
        // Add test user details
        name: "Test User",
        email: "test@example.com",
        contact: "9999999999",
      },
      notes: {
        // Add test card details as notes that will be visible on payment page
        "Test Card Number": "4111 1111 1111 1111",
        "Test CVV": "Any 3 digits",
        "Test Expiry": "Any future date",
        "Test OTP": "1111",
      },
      modal: {
        confirm_close: true,
        escape: false,
        handleback: true,
        ondismiss: () => {
          console.log("Payment cancelled");
        },
      },
      handler: function (response) {
        //send successful wala mail
        sendPaymentSuccessEmail(
          response,
          orderResponse.data.data.amount,
          token
        );
        //verifyPayment
        verifyPayment({ ...response, courses }, token, navigate, dispatch);
      },
    };
    //miss hogya tha
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
    paymentObject.on("payment.failed", function (response) {
      toast.error("oops, payment failed");
      console.log(response.error);
    });
  } catch (error) {
    console.log("PAYMENT API ERROR.....", error);
    toast.error("Could not make Payment");
  }
  toast.dismiss(toastId);
}
console.log("Razorpay Key:", process.env.REACT_APP_RAZORPAY_KEY);
async function sendPaymentSuccessEmail(response, amount, token) {
  try {
    await apiConnector(
      "POST",
      SEND_PAYMENT_SUCCESS_EMAIL_API,
      {
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        amount,
      },
      {
        Authorization: `Bearer ${token}`,
      }
    );
  } catch (error) {
    console.log("PAYMENT SUCCESS EMAIL ERROR....", error);
  }
}

//verify payment
async function verifyPayment(bodyData, token, navigate, dispatch) {
  const toastId = toast.loading("Verifying Payment....");
  dispatch(setPaymentLoading(true));
  try {
    const response = await apiConnector("POST", COURSE_VERIFY_API, bodyData, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    toast.success("payment Successful, ypou are addded to the course");
    navigate("/dashboard/enrolled-courses");
    dispatch(resetCart());
  } catch (error) {
    console.log("PAYMENT VERIFY ERROR....", error);
    toast.error("Could not verify Payment");
  }
  toast.dismiss(toastId);
  dispatch(setPaymentLoading(false));
}

const handleBuyPress = async (
  courses,
  token,
  userDetails,
  navigate,
  dispatch
) => {
  console.log("Payment Flow Started");
  try {
    const orderResponse = await apiConnector("POST", COURSE_PAYMENT_API, {
      courses,
    });
    console.log("Order Response:", orderResponse);

    if (!orderResponse.data.success) {
      throw new Error(orderResponse.data.message);
    }

    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY,
      amount: `${orderResponse.data.data.amount}`,
      currency: orderResponse.data.data.currency,
      name: "StudyNotion",
      description: "Thank You for Purchasing the Course",
      order_id: orderResponse.data.data.id,
      prefill: {
        // Add test user details
        name: "Test User",
        email: "test@example.com",
        contact: "9999999999",
      },
      notes: {
        // Add test card details as notes that will be visible on payment page
        "Test Card Number": "4111 1111 1111 1111",
        "Test CVV": "Any 3 digits",
        "Test Expiry": "Any future date",
        "Test OTP": "1111",
      },
      modal: {
        confirm_close: true,
        escape: false,
        handleback: true,
        ondismiss: () => {
          console.log("Payment cancelled");
        },
      },
    };

    console.log("Razorpay Options:", {
      ...options,
      // Don't log sensitive data
      key: options.key ? "Present" : "Missing",
    });

    const paymentObject = new window.Razorpay(options);
    console.log("Payment Object Created");
    paymentObject.open();
  } catch (error) {
    console.error("Payment Error:", error);
  }
};
