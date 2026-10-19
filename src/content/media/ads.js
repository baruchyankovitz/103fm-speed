// Google (IMA) ads usually play in a <video> inside their own container
export const AD_BOX = '#ima-container,.ima-ad-container,[id*="ima-ad"]';
export const isAd = el => el.id === 'ima-player' || !!el.closest?.(AD_BOX);
export const isContent = el => !isAd(el) && el.duration > 60 && isFinite(el.duration);
