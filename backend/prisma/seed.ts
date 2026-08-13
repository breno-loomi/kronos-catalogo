import { PrismaClient } from '@prisma/client';
import { type Stock, emptyStock } from '../src/domain/entities/product';

const prisma = new PrismaClient();

function stock(pairs: Partial<Stock>): Stock {
  return { ...emptyStock(), ...pairs };
}

// Os mesmos dez produtos do SEED original em kronos-store.js.
const SEED = [
  {
    brand: 'On Running',
    cat: 'lifestyle',
    name: 'Cloudtilt',
    desc: 'CloudTec Phase em preto e branco. Passada macia para uso diário.',
    price: 1590,
    avail: 'Pronta entrega',
    img: 'uploads/WhatsApp Image 2026-08-10 at 20.22.56.jpeg',
    stock: stock({ '39': 2, '40': 3, '41': 1, '42': 2 }),
  },
  {
    brand: 'New Balance',
    cat: 'lifestyle',
    name: '9060',
    desc: 'Camurça cream com entressola ABZORB esculpida.',
    price: 1290,
    avail: 'Pronta entrega',
    img: 'uploads/WhatsApp Image 2026-08-10 at 20.22.55.jpeg',
    stock: stock({ '38': 1, '40': 2, '42': 4, '43': 1 }),
  },
  {
    brand: 'New Balance',
    cat: 'lifestyle',
    name: '530 Moon Daze',
    desc: 'Mesh off-white com detalhes prata. O clássico dos anos 2000.',
    price: 899,
    avail: 'Pronta entrega',
    img: 'uploads/WhatsApp Image 2026-08-10 at 20.22.56 (2).jpeg',
    stock: stock({ '36': 2, '37': 3, '38': 2, '39': 1, '40': 2 }),
  },
  {
    brand: 'New Balance',
    cat: 'lifestyle',
    name: '530 Mocha',
    desc: 'Mesh cream com sobreposições marrom e solado ABZORB.',
    price: 899,
    avail: 'Pronta entrega',
    img: 'uploads/WhatsApp Image 2026-08-10 at 20.22.56 (1).jpeg',
    stock: stock({ '39': 1, '41': 2, '42': 2 }),
  },
  {
    brand: 'Nike',
    cat: 'corrida',
    name: 'Pegasus 41',
    desc: 'Rodagem diária com amortecimento reativo e cabedal em mesh.',
    price: 899,
    avail: 'Pronta entrega',
    img: '',
    stock: stock({ '40': 2, '41': 3, '42': 3, '43': 2 }),
  },
  {
    brand: 'Adidas',
    cat: 'corrida',
    name: 'Adizero SL2',
    desc: 'Treino de ritmo e prova curta. Entressola Lightstrike Pro.',
    price: 1099,
    avail: 'Pronta entrega',
    img: '',
    stock: stock({ '39': 1, '40': 1, '42': 2 }),
  },
  {
    brand: 'Nike',
    cat: 'prova',
    name: 'Vaporfly 4',
    desc: 'Placa de carbono full-length. Chega em 15 a 25 dias.',
    price: 2290,
    avail: 'Por encomenda',
    img: '',
    stock: stock({}),
  },
  {
    brand: 'Adidas',
    cat: 'lifestyle',
    name: 'Samba OG',
    desc: 'Couro pleno flor, uso urbano. Numerações sob encomenda.',
    price: 749,
    avail: 'Por encomenda',
    img: '',
    stock: stock({}),
  },
  {
    brand: 'New Balance',
    cat: 'lifestyle',
    name: '990 v6',
    desc: 'Fabricação nos EUA. Prazo de 20 a 30 dias.',
    price: 1890,
    avail: 'Por encomenda',
    img: '',
    stock: stock({}),
  },
  {
    brand: 'On Running',
    cat: 'trail',
    name: 'Cloudultra 2',
    desc: 'Trilha longa, solado Missiongrip. Chega em 15 a 25 dias.',
    price: 1790,
    avail: 'Por encomenda',
    img: '',
    stock: stock({}),
  },
];

async function main() {
  const existing = await prisma.product.count();
  if (existing > 0) {
    console.log(`Já existem ${existing} produtos — seed ignorado (banco não está vazio).`);
  } else {
    for (const product of SEED) {
      await prisma.product.create({
        data: {
          brand: product.brand,
          cat: product.cat,
          name: product.name,
          desc: product.desc,
          price: product.price,
          avail: product.avail,
          img: product.img,
          stock: {
            create: Object.entries(product.stock).map(([size, qty]) => ({ size, qty })),
          },
        },
      });
    }
    console.log(`${SEED.length} produtos inseridos.`);
  }

  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, phone: '5511999999999' },
  });
  console.log('Settings garantido (phone padrão 5511999999999).');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
