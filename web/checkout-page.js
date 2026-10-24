/* Baylos checkout preview: no order creation until backend shipping and stock validation are deployed. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const list=$('items'), form=$('form'), submit=$('submit'), result=$('result'), refresh=$('refresh-cart');
const cart=window.BaylosVariantCart;
const money=value=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(value);
function note(message){result.textContent=message;}
function line(label,quantity,price){const li=document.createElement('li');li.textContent=`${label} · ${quantity} pcs${Number.isFinite(price)?' · '+money(price*quantity):''}`;return li;}
async function render(){
 list.replaceChildren();const lines=cart?.read()||[];
 if(!lines.length){list.append(line('Keranjang kosong',0));$('subtotal').textContent='—';note('Pilih produk di etalase terlebih dahulu.');return;}
 const client=window.BaylosAPI?.client;
 if(!client){lines.forEach(item=>list.append(line('Produk '+item.product_id.slice(0,8),item.quantity)));note('Koneksi Supabase belum tersedia.');return;}
 const ids=[...new Set(lines.map(x=>x.product_id))];
 const {data:products,error}=await client.from('products').select('id,name,retail_price,is_active').in('id',ids);
 if(error){lines.forEach(item=>list.append(line('Produk '+item.product_id.slice(0,8),item.quantity)));note('Gagal memuat rincian produk. Silakan coba lagi.');return;}
 const map=new Map((products||[]).map(p=>[p.id,p]));let subtotal=0,valid=true;
 for(const item of lines){const p=map.get(item.product_id);if(!p?.is_active){valid=false;list.append(line('Produk tidak tersedia ('+item.product_id.slice(0,8)+')',item.quantity));continue;}
 const price=Number(p.retail_price);if(!Number.isFinite(price)||price<0){valid=false;list.append(line(p.name,item.quantity));continue;}
 subtotal+=price*item.quantity;list.append(line(p.name+(item.variant_id?' · varian '+item.variant_id.slice(0,8):''),item.quantity,price));}
 $('subtotal').textContent=valid?money(subtotal):'Perlu pemeriksaan produk';
 $('price-notice').textContent='Perkiraan menggunakan harga retail. Harga reseller, stok, dan ongkir final hanya dapat ditetapkan oleh server.';
 note('Checkout masih terkunci sampai validasi transaksi, ongkir, dan pembayaran selesai.');
}
submit.disabled=true;submit.textContent='Checkout belum tersedia';
form.addEventListener('submit',e=>{e.preventDefault();note('Checkout belum aktif. Tidak ada pesanan atau pembayaran yang dibuat.');});
refresh?.addEventListener('click',()=>{render().catch(()=>note('Gagal memuat keranjang.'));});
render().catch(()=>note('Gagal memuat keranjang.'));
})();
