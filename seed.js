require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data (optional, be careful in production!)
        // await User.deleteMany({});
        // await Product.deleteMany({});

        // 1. Create Admin User
        const adminEmail = 'admin@szomszedkosar.hu';
        let admin = await User.findOne({ email: adminEmail });
        if (!admin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            admin = await User.create({
                name: 'Admin User',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin' // Assuming you have an admin role, or just use 'producer'/'buyer'
            });
            console.log('Admin user created');
        }

        // 2. Create Producer User
        const producerEmail = 'termelo@szomszedkosar.hu';
        let producer = await User.findOne({ email: producerEmail });
        if (!producer) {
            const hashedPassword = await bcrypt.hash('termelo123', 10);
            producer = await User.create({
                name: 'Kovács János Termelő',
                email: producerEmail,
                password: hashedPassword,
                role: 'producer',
                city: 'Debrecen',
                bio: 'Helyi kistermelő vagyok, friss zöldségekkel és gyümölcsökkel.',
                phone: '+36 30 111 2222'
            });
            console.log('Producer user created');
        }

        // 3. Create Sample Products
        const sampleProducts = [
            {
                name: 'Friss Házi Paradicsom',
                description: 'Vegyszermentes, napérlelte paradicsom a kertemből.',
                price: 800,
                unit: 'kg',
                category: 'Zöldség',
                imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
                stock: 50,
                sellerEmail: producerEmail,
                isShippable: false,
                location: 'Debrecen'
            },
            {
                name: 'Akácméz',
                description: 'Idei pergetésű tiszta akácméz.',
                price: 3500,
                unit: 'üveg',
                category: 'Egyéb',
                imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
                stock: 20,
                sellerEmail: producerEmail,
                isShippable: true,
                location: 'Debrecen'
            },
            {
                name: 'Kovászos Kenyér',
                description: 'Hagyományos eljárással készült, ropogós héjú kenyér.',
                price: 1200,
                unit: 'db',
                category: 'Pékáru',
                imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
                stock: 10,
                sellerEmail: producerEmail,
                isShippable: false,
                location: 'Debrecen'
            },
            {
                name: 'Friss Tojás',
                description: 'Szabadtartású tyúkoktól származó tojás.',
                price: 80,
                unit: 'db',
                category: 'Egyéb',
                imageUrl: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80',
                stock: 100,
                sellerEmail: producerEmail,
                isShippable: false,
                location: 'Debrecen'
            },
            {
                name: 'Alma (Gála)',
                description: 'Édes, ropogós Gála alma.',
                price: 450,
                unit: 'kg',
                category: 'Gyümölcs',
                imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
                stock: 200,
                sellerEmail: producerEmail,
                isShippable: true,
                location: 'Debrecen'
            }
        ];

        for (const prod of sampleProducts) {
            const existing = await Product.findOne({ name: prod.name, sellerEmail: producerEmail });
            if (!existing) {
                await Product.create(prod);
                console.log(`Created product: ${prod.name}`);
            }
        }

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedData();
