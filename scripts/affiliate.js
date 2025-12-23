// ===== AFFILIATE LINK TRACKING =====

const affiliateLinks = document.querySelectorAll('a[target="_blank"]');

affiliateLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    const url = this.href;
    const text = this.textContent.trim();
    const category = this.closest('[data-category]')?.getAttribute('data-category') || 'unknown';
    const isAffiliateBadge = this.classList.contains('affiliate-badge');
    const isDealButton = this.classList.contains('deal-button');
    
    // Extract platform name
    let platform = 'unknown';
    if (url.includes('booking.com')) platform = 'Booking.com';
    else if (url.includes('agoda.com')) platform = 'Agoda';
    // else if (url.includes('makemytrip.com')) platform = 'MakeMyTrip';  // DISABLED
    else if (url.includes('cleartrip.com')) platform = 'Cleartrip';
    else if (url.includes('1mg.com')) platform = '1mg';
    else if (url.includes('pharmeasy.in')) platform = 'PharmEasy';
    else if (url.includes('healthians.com')) platform = 'Healthians';
    else if (url.includes('thyrocare.com')) platform = 'Thyrocare';
    else if (url.includes('policybazaar.com')) platform = 'PolicyBazaar';
    else if (url.includes('amazon.in')) platform = 'Amazon';
    else if (url.includes('flipkart.com')) platform = 'Flipkart';
    
    // Track to Google Analytics
    trackEvent('affiliate_click', {
      'event_category': 'Affiliate',
      'event_label': platform,
      'value': category,
      'click_type': isAffiliateBadge ? 'badge' : (isDealButton ? 'deal_button' : 'link'),
      'link_text': text
    });
    
    // Console logging for debugging
    console.log('🔗 Affiliate Link Clicked:', {
      text: text,
      platform: platform,
      category: category,
      url: url,
      clickType: isAffiliateBadge ? 'badge' : (isDealButton ? 'deal_button' : 'link'),
      hasTrackingId: url.includes('REPLACE_WITH_AFFILIATE_ID') ? '❌ NO' : '✅ YES'
    });
    
    // Alert if tracking ID not replaced
    if (url.includes('REPLACE_WITH_AFFILIATE_ID')) {
      alert('⚠️ Warning: Affiliate tracking ID not set!\n\nPlease replace REPLACE_WITH_AFFILIATE_ID with your actual affiliate ID.');
      e.preventDefault();
      return false;
    }
  });
});
