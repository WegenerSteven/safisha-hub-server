import { DataSource } from 'typeorm';
import { User, Role } from '../src/users/entities/user.entity';
import { Service } from '../src/services/entities/service.entity';
import { ServiceCategory } from '../src/services/entities/service-category.entity';
import { ServiceType, ServiceStatus, VehicleType } from '../src/services/enums/service.enums';
import * as bcrypt from 'bcrypt';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432'),
  username: process.env.PG_USERNAME || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  database: process.env.PG_DATABASE || 'safishahub',
  entities: [User, Service, ServiceCategory],
  synchronize: false,
});

async function seedTestData() {
  try {
    await AppDataSource.initialize();
    console.log('Connected to database');

    const userRepository = AppDataSource.getRepository(User);
    const serviceRepository = AppDataSource.getRepository(Service);
    const categoryRepository = AppDataSource.getRepository(ServiceCategory);

    // Create service category first
    let category = await categoryRepository.findOne({ where: { name: 'Car Wash' } });
    if (!category) {
      category = categoryRepository.create({
        name: 'Car Wash',
        description: 'Professional car washing services',
        is_active: true,
      });
      await categoryRepository.save(category);
      console.log('Created service category');
    }

    // Create test service providers
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    const serviceProviders = [
      {
        email: 'info@premiumautospa.com',
        password: hashedPassword,
        first_name: 'John',
        last_name: 'Smith',
        phone: '(555) 123-4567',
        role: Role.SERVICE_PROVIDER,
        business_name: 'Premium Auto Spa',
        business_type: 'Full Service Car Wash',
        business_description: 'Professional car wash and detailing services with eco-friendly products. We provide premium care for your vehicle with experienced staff and state-of-the-art equipment.',
        business_address: '123 Main Street',
        city: 'Downtown',
        state: 'CA',
        zip_code: '90210',
        business_phone: '(555) 123-4567',
        business_email: 'info@premiumautospa.com',
        business_image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop',
        rating: 4.8,
        total_reviews: 156,
        operating_hours: {
          monday: { open: '08:00', close: '18:00', closed: false },
          tuesday: { open: '08:00', close: '18:00', closed: false },
          wednesday: { open: '08:00', close: '18:00', closed: false },
          thursday: { open: '08:00', close: '18:00', closed: false },
          friday: { open: '08:00', close: '19:00', closed: false },
          saturday: { open: '09:00', close: '17:00', closed: false },
          sunday: { open: '10:00', close: '16:00', closed: false }
        },
        latitude: 34.0522,
        longitude: -118.2437,
        is_active: true,
        is_verified: true,
      },
      {
        email: 'contact@quickcleanexpress.com',
        password: hashedPassword,
        first_name: 'Sarah',
        last_name: 'Johnson',
        phone: '(555) 987-6543',
        role: Role.SERVICE_PROVIDER,
        business_name: 'Quick Clean Express',
        business_type: 'Express Car Wash',
        business_description: 'Fast and efficient car wash services for busy professionals. Get your car sparkling clean in under 15 minutes with our automated wash systems.',
        business_address: '456 Oak Avenue',
        city: 'Westside',
        state: 'CA',
        zip_code: '90211',
        business_phone: '(555) 987-6543',
        business_email: 'contact@quickcleanexpress.com',
        business_image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop',
        rating: 4.9,
        total_reviews: 203,
        operating_hours: {
          monday: { open: '07:00', close: '20:00', closed: false },
          tuesday: { open: '07:00', close: '20:00', closed: false },
          wednesday: { open: '07:00', close: '20:00', closed: false },
          thursday: { open: '07:00', close: '20:00', closed: false },
          friday: { open: '07:00', close: '20:00', closed: false },
          saturday: { open: '08:00', close: '20:00', closed: false },
          sunday: { open: '09:00', close: '19:00', closed: false }
        },
        latitude: 34.0522,
        longitude: -118.2437,
        is_active: true,
        is_verified: true,
      },
      {
        email: 'book@mobiledetailingpro.com',
        password: hashedPassword,
        first_name: 'Michael',
        last_name: 'Ochieng',
        phone: '(555) 456-7890',
        role: Role.SERVICE_PROVIDER,
        business_name: 'Mobile Detailing Pro',
        business_type: 'Mobile Car Wash',
        business_description: 'We come to you! Professional mobile car detailing services at your home or office. Convenient scheduling and premium results guaranteed.',
        business_address: 'Service Area: All of Orange County',
        city: 'Orange County',
        state: 'CA',
        zip_code: '92000',
        business_phone: '(555) 456-7890',
        business_email: 'book@mobiledetailingpro.com',
        business_image: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=600&h=400&fit=crop',
        rating: 4.7,
        total_reviews: 89,
        operating_hours: {
          monday: { open: '08:00', close: '17:00', closed: false },
          tuesday: { open: '08:00', close: '17:00', closed: false },
          wednesday: { open: '08:00', close: '17:00', closed: false },
          thursday: { open: '08:00', close: '17:00', closed: false },
          friday: { open: '08:00', close: '17:00', closed: false },
          saturday: { open: '09:00', close: '15:00', closed: false },
          sunday: { open: '', close: '', closed: true }
        },
        latitude: 33.7175,
        longitude: -117.8311,
        is_active: true,
        is_verified: true,
      }
    ];

    // Create or update service providers
    const createdProviders: User[] = [];
    for (const providerData of serviceProviders) {
      let provider = await userRepository.findOne({ where: { email: providerData.email } });
      if (!provider) {
        provider = userRepository.create(providerData);
        await userRepository.save(provider);
        console.log(`Created service provider: ${provider.business_name}`);
      } else {
        // Update existing provider with new fields
        await userRepository.update(provider.id, {
          business_type: providerData.business_type,
          business_description: providerData.business_description,
          city: providerData.city,
          state: providerData.state,
          zip_code: providerData.zip_code,
          business_email: providerData.business_email,
          business_image: providerData.business_image,
          rating: providerData.rating,
          total_reviews: providerData.total_reviews,
          operating_hours: providerData.operating_hours,
        });
        console.log(`Updated service provider: ${provider.business_name}`);
      }
      createdProviders.push(provider);
    }

    // Create services for each provider
    const services = [
      {
        provider_id: createdProviders[0].id,
        category_id: category.id,
        name: 'Basic Wash',
        description: 'Exterior wash and basic interior vacuum',
        service_type: ServiceType.BASIC,
        vehicle_type: VehicleType.SEDAN,
        base_price: 15.00,
        duration_minutes: 20,
        status: ServiceStatus.ACTIVE,
        features: ['Exterior wash', 'Tire cleaning', 'Basic interior vacuum'],
        is_active: true,
        is_available: true,
      },
      {
        provider_id: createdProviders[0].id,
        category_id: category.id,
        name: 'Premium Detail',
        description: 'Complete interior and exterior detailing',
        service_type: ServiceType.PREMIUM,
        vehicle_type: VehicleType.SEDAN,
        base_price: 45.00,
        duration_minutes: 60,
        status: ServiceStatus.ACTIVE,
        features: ['Everything in Basic', 'Interior detailing', 'Wax coating', 'Dashboard cleaning'],
        is_active: true,
        is_available: true,
      },
      {
        provider_id: createdProviders[0].id,
        category_id: category.id,
        name: 'Full Service',
        description: 'Complete wash, wax, and interior deep clean',
        service_type: ServiceType.DELUXE,
        vehicle_type: VehicleType.SEDAN,
        base_price: 75.00,
        duration_minutes: 90,
        status: ServiceStatus.ACTIVE,
        features: ['Everything in Premium', 'Leather conditioning', 'Engine bay cleaning', 'Tire shine'],
        is_active: true,
        is_available: true,
      },
      {
        provider_id: createdProviders[1].id,
        category_id: category.id,
        name: 'Express Wash',
        description: 'Quick exterior wash and dry',
        service_type: ServiceType.BASIC,
        vehicle_type: VehicleType.SEDAN,
        base_price: 12.00,
        duration_minutes: 15,
        status: ServiceStatus.ACTIVE,
        features: ['Quick exterior wash', 'Rapid dry', 'Tire cleaning'],
        is_active: true,
        is_available: true,
      },
      {
        provider_id: createdProviders[1].id,
        category_id: category.id,
        name: 'Wash & Wax',
        description: 'Wash, wax, and tire shine',
        service_type: ServiceType.PREMIUM,
        vehicle_type: VehicleType.SEDAN,
        base_price: 25.00,
        duration_minutes: 25,
        status: ServiceStatus.ACTIVE,
        features: ['Exterior wash', 'Wax application', 'Tire shine', 'Quick interior'],
        is_active: true,
        is_available: true,
      },
      {
        provider_id: createdProviders[2].id,
        category_id: category.id,
        name: 'Mobile Basic',
        description: 'Basic wash and vacuum at your location',
        service_type: ServiceType.BASIC,
        vehicle_type: VehicleType.SEDAN,
        base_price: 25.00,
        duration_minutes: 30,
        status: ServiceStatus.ACTIVE,
        features: ['Mobile service', 'Exterior wash', 'Interior vacuum', 'Convenience'],
        is_active: true,
        is_available: true,
      },
      {
        provider_id: createdProviders[2].id,
        category_id: category.id,
        name: 'Mobile Premium',
        description: 'Complete detailing service at your location',
        service_type: ServiceType.PREMIUM,
        vehicle_type: VehicleType.SEDAN,
        base_price: 55.00,
        duration_minutes: 75,
        status: ServiceStatus.ACTIVE,
        features: ['Mobile service', 'Complete detailing', 'Interior protection', 'Wax coating'],
        is_active: true,
        is_available: true,
      },
      {
        provider_id: createdProviders[2].id,
        category_id: category.id,
        name: 'Mobile Deluxe',
        description: 'Full service detail with wax and interior protection',
        service_type: ServiceType.DELUXE,
        vehicle_type: VehicleType.SEDAN,
        base_price: 85.00,
        duration_minutes: 120,
        status: ServiceStatus.ACTIVE,
        features: ['Mobile service', 'Premium detailing', 'Paint protection', 'Interior conditioning'],
        is_active: true,
        is_available: true,
      }
    ];

    // Create services
    for (const serviceData of services) {
      const existingService = await serviceRepository.findOne({
        where: { 
          name: serviceData.name,
          provider_id: serviceData.provider_id 
        }
      });

      if (!existingService) {
        const service = serviceRepository.create(serviceData);
        await serviceRepository.save(service);
        console.log(`Created service: ${service.name} for provider: ${createdProviders.find(p => p.id === service.provider_id)?.business_name}`);
      }
    }

    console.log('Test data seeded successfully!');
    console.log(`Created ${createdProviders.length} service providers`);
    console.log(`Created ${services.length} services`);

  } catch (error) {
    console.error('Error seeding test data:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seedTestData();
