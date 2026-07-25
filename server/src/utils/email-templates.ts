export const getPasswordChangeOtpEmail = (otp: string, expiryMins: number) => {
  return {
    subject: `Your OTP for password change`,
    text: `Your OTP is ${otp}. It will expire in ${expiryMins} minutes. Ignore this email if you did not request this action.`,
    html: `<div>
      <p>Hello,</p>
      <p>Your OTP for password change is <strong>${otp}</strong>.</p>
      <p>It will expire in ${expiryMins} minutes.</p>
      <p><em>Ignore this email if you did not request this action.</em></p>
    </div>`
  };
};

export const getOldEmailChangeOtpEmail = (otp: string, expiryMins: number) => {
  return {
    subject: `Your OTP to change email address`,
    text: `Your OTP is ${otp}. It will expire in ${expiryMins} minutes. Ignore this email if you did not request this action.`,
    html: `<div>
      <p>Hello,</p>
      <p>Your OTP for verifying your current email address is <strong>${otp}</strong>.</p>
      <p>It will expire in ${expiryMins} minutes.</p>
      <p><em>Ignore this email if you did not request this action.</em></p>
    </div>`
  };
};

export const getNewEmailVerificationOtpEmail = (otp: string, expiryMins: number) => {
  return {
    subject: `Verify your new email address`,
    text: `Your OTP is ${otp}. It will expire in ${expiryMins} minutes. Ignore this email if you did not request this action.`,
    html: `<div>
      <p>Hello,</p>
      <p>Your OTP for verifying this new email address is <strong>${otp}</strong>.</p>
      <p>It will expire in ${expiryMins} minutes.</p>
      <p><em>Ignore this email if you did not request this action.</em></p>
    </div>`
  };
};

export const getPasswordChangedEmail = () => {
  return {
    subject: `Your password has been changed`,
    text: `Your account password was just changed. If this was not you, please contact support immediately.`,
    html: `<div>
      <p>Hello,</p>
      <p>Your account password was just changed.</p>
      <p><strong>If this was not you, please contact support immediately.</strong></p>
    </div>`
  };
};

export const getEmailChangedEmail = () => {
  return {
    subject: `Your email address has been changed`,
    text: `Your account email address was just changed. If this was not you, please contact support immediately.`,
    html: `<div>
      <p>Hello,</p>
      <p>Your account email address was just changed.</p>
      <p><strong>If this was not you, please contact support immediately.</strong></p>
    </div>`
  };
};
