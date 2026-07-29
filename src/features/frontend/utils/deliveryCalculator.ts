export interface DeliveryEstimateParams {
  isCustomizable: boolean;
  customizationCompleted: boolean;
  preparationTimeMinutes?: number;
  pincode?: string;
  isSameDayEligible?: boolean;
}

export interface DeliveryEstimateResult {
  title: string;
  subtitle: string;
  deliveryCharge: number;
  isSameDay: boolean;
  estimatedDateStr: string;
  serviceable: boolean;
  message: string;
}

export const calculateDeliveryEstimate = (params: DeliveryEstimateParams): DeliveryEstimateResult => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const totalMinutesNow = currentHour * 60 + currentMinute;

  // 2:00 PM cutoff is 14:00 (840 minutes)
  const cutoffMinutes = 14 * 60;

  const isBeforeCutoff = totalMinutesNow < cutoffMinutes;

  // If outside operational hours (8 AM to 8 PM)
  const isOutsideStoreHours = currentHour < 8 || currentHour >= 20;

  if (params.isCustomizable && !params.customizationCompleted) {
    return {
      title: 'Complete Personalisation',
      subtitle: 'Delivery time confirmed after customisation',
      deliveryCharge: 49,
      isSameDay: false,
      estimatedDateStr: 'Tomorrow',
      serviceable: true,
      message: 'Complete the customisation steps to calculate exact 10-min or same-day Jaipur delivery.'
    };
  }

  // Jaipur delivery zones check (Jaipur pincodes start with 3020...)
  if (params.pincode && !params.pincode.startsWith('302')) {
    return {
      title: 'Standard Shipping',
      subtitle: 'Delivered in 2-4 business days',
      deliveryCharge: 99,
      isSameDay: false,
      estimatedDateStr: '2-4 Days',
      serviceable: true,
      message: 'Standard courier delivery outside Jaipur hyperlocal zone.'
    };
  }

  if (isOutsideStoreHours) {
    return {
      title: 'Scheduled for Tomorrow Morning',
      subtitle: 'Store operating hours 8 AM - 8 PM',
      deliveryCharge: 49,
      isSameDay: false,
      estimatedDateStr: 'Tomorrow, 9:00 AM - 11:00 AM',
      serviceable: true,
      message: 'Orders placed after operating hours will be prioritized for morning dispatch.'
    };
  }

  if (isBeforeCutoff && params.isSameDayEligible) {
    return {
      title: 'Express 10-Min / Same-Day Delivery',
      subtitle: 'Get it today by ' + (params.isCustomizable ? 'Today, 6:00 PM' : 'Today, in 10-30 mins'),
      deliveryCharge: 0,
      isSameDay: true,
      estimatedDateStr: 'Today, ' + (params.isCustomizable ? '5:00 PM - 7:00 PM' : 'Within 30 Mins'),
      serviceable: true,
      message: 'Lightning fast hyperlocal delivery across Jaipur.'
    };
  }

  // After cutoff (2 PM) but exception feasible (if before 6 PM and prep time < 60 mins)
  if (!isBeforeCutoff && currentHour < 18 && params.isSameDayEligible) {
    return {
      title: 'Limited Same-Day Delivery Available',
      subtitle: 'Get it today before 8:00 PM',
      deliveryCharge: 29,
      isSameDay: true,
      estimatedDateStr: 'Today, 6:30 PM - 8:00 PM',
      serviceable: true,
      message: 'Late afternoon express slot secured for Jaipur zone.'
    };
  }

  return {
    title: 'Next-Day Priority Delivery',
    subtitle: 'Delivered tomorrow morning',
    deliveryCharge: 0,
    isSameDay: false,
    estimatedDateStr: 'Tomorrow, 9:00 AM - 12:00 PM',
    serviceable: true,
    message: 'Guaranteed morning priority delivery in Jaipur.'
  };
};
