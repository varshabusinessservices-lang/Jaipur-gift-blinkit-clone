import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
}

export const SEO = ({
  title = 'Jaipur Gifting | 10-Minute Luxury Gifting & Mithai Delivery',
  description = 'Send luxury mithai, birthday cakes, fresh flowers & personalised gift hampers in 10 minutes across Jaipur.'
}: SEOProps) => {
  useEffect(() => {
    document.title = title;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);
  }, [title, description]);

  return null;
};
