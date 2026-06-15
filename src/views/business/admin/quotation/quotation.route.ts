import type { Router } from 'vue-router';

function buildCandidatePaths(currentPath?: string) {
  if (!currentPath) return [];
  const candidates = [
    currentPath.replace(/InquiryList$/i, 'QuotationList'),
    currentPath.replace(/inquiryPage$/i, 'quotationPage'),
    currentPath.replace(/\/inquiry$/i, '/quote'),
    currentPath.replace(/\/inquiry$/i, '/quotation'),
    currentPath.replace(/inquiry/i, 'quote'),
    currentPath.replace(/inquiry/i, 'quotation'),
  ];
  return [...new Set(candidates.filter(Boolean))];
}

export function resolveQuoteRoutePath(router: Router, currentPath?: string) {
  const routes = router.getRoutes();
  const candidatePaths = buildCandidatePaths(currentPath);
  const exactMatched = candidatePaths.find((candidate) => routes.some((item) => item.path === candidate));
  if (exactMatched) return exactMatched;

  const matched =
    routes.find((item) => item.path !== currentPath && /quotationpage|quote/i.test(item.path) && !/inquiry/i.test(item.path)) ||
    routes.find((item) => item.path !== currentPath && item.path.includes('/quotation/') && !item.path.includes('inquiry'));
  return matched?.path || candidatePaths[0] || '/quotation';
}

export function buildInquiryQuoteRouteQuery(inquiryId: string) {
  return {
    inquiryId,
    t: `${Date.now()}`,
  };
}
