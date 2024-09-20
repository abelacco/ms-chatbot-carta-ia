import { ICompany } from "../interfaces/companies.interfaces";

export function parseCompany(company: any): ICompany {
  return {
    id: company.id,
    createdAt: company.created_at,  // Asegúrate de usar snake case aquí
    updatedAt: company.updated_at,  // Asegúrate de usar snake case aquí
    name: company.name,
    subdomain: company.subdomain,
    logo: company.logo,
    cover: company.cover,
    active: company.active,
    userId: company.user_id,        // Asegúrate de usar snake case aquí
    lat: company.lat,
    lng: company.lng,
    address: company.address,
    phone: company.phone,
    minimum: company.minimum,
    description: company.description,
    fee: company.fee,
    staticFee: company.static_fee,  // Asegúrate de usar snake case aquí
    radius: company.radius,
    isFeatured: company.is_featured,  // Asegúrate de usar snake case aquí
    cityId: company.city_id,          // Asegúrate de usar snake case aquí
    views: company.views,
    canPickup: company.can_pickup,    // Asegúrate de usar snake case aquí
    canDeliver: company.can_deliver,  // Asegúrate de usar snake case aquí
    selfDeliver: company.self_deliver, // Asegúrate de usar snake case aquí
    freeDeliver: company.free_deliver, // Asegúrate de usar snake case aquí
    whatsappPhone: company.whatsapp_phone, // Asegúrate de usar snake case aquí
    fbUsername: company.fb_username,   // Asegúrate de usar snake case aquí
    doCovertion: company.do_covertion,  // Asegúrate de usar snake case aquí
    currency: company.currency,
    paymentInfo: company.payment_info,  // Asegúrate de usar snake case aquí
    molliePaymentKey: company.mollie_payment_key, // Asegúrate de usar snake case aquí
    deletedAt: company.deleted_at,      // Asegúrate de usar snake case aquí
    canDinein: company.can_dinein,      // Asegúrate de usar snake case aquí
  };
}
