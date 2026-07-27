export interface Testimonial {
  name: string;
  city: string;
  rating: number;
  treatment: string;
  quote: string;
}

export const testimonials: Testimonial[] = [
  {
    name: "Rajesh Iyer",
    city: "Mumbai",
    rating: 5,
    treatment: "Cardiac Bypass Surgery",
    quote:
      "The cardiology team at Niramaya gave me a second chance at life. From diagnosis to surgery to recovery, every step felt reassuring and well-planned.",
  },
  {
    name: "Sunita Deshmukh",
    city: "Pune",
    rating: 5,
    treatment: "Knee Replacement",
    quote:
      "I was dreading knee surgery, but the orthopedics team made the entire process painless and simple. I'm walking without discomfort for the first time in years.",
  },
  {
    name: "Arvind Menon",
    city: "Bengaluru",
    rating: 5,
    treatment: "General Consultation",
    quote:
      "What stood out was how much time the doctor took to actually listen. No rushing, no jargon — just clear answers and a plan I understood.",
  },
  {
    name: "Priya Nair",
    city: "Kochi",
    rating: 4,
    treatment: "Pediatric Care",
    quote:
      "Our daughter was nervous about her check-up, but the pediatric staff were so warm and patient with her. She now asks when she can visit again.",
  },
  {
    name: "Vikram Chauhan",
    city: "Delhi",
    rating: 5,
    treatment: "Emergency Care",
    quote:
      "We rushed in at 2 AM after an accident and the emergency team had us stabilized within minutes. Their speed and calm under pressure was remarkable.",
  },
  {
    name: "Anjali Reddy",
    city: "Hyderabad",
    rating: 5,
    treatment: "Women's Wellness Package",
    quote:
      "The health package covered everything I needed and the results were explained clearly by the doctor instead of just being handed a report.",
  },
  {
    name: "Sandeep Rao",
    city: "Chennai",
    rating: 4,
    treatment: "Neurology Consultation",
    quote:
      "After months of unexplained migraines, the neurology team finally identified the cause and got me on a treatment plan that actually works.",
  },
  {
    name: "Meera Joshi",
    city: "Ahmedabad",
    rating: 5,
    treatment: "Maternity Care",
    quote:
      "From my first prenatal visit to delivery, the entire team made me feel safe and cared for. I couldn't have asked for a better experience.",
  },
  {
    name: "Karan Malhotra",
    city: "Chandigarh",
    rating: 5,
    treatment: "Dermatology Treatment",
    quote:
      "Years of struggling with a skin condition, and the dermatology team here finally got it under control within a few months.",
  },
  {
    name: "Fatima Sheikh",
    city: "Lucknow",
    rating: 4,
    treatment: "ENT Surgery",
    quote:
      "My sinus surgery went smoothly and the follow-up care was thorough. The staff always answered my questions promptly, even after discharge.",
  },
  {
    name: "Devendra Patil",
    city: "Nagpur",
    rating: 5,
    treatment: "General Medicine",
    quote:
      "Managing my diabetes used to feel overwhelming. The general medicine team built a simple routine for me that has genuinely improved my health.",
  },
  {
    name: "Lakshmi Venkatesh",
    city: "Coimbatore",
    rating: 5,
    treatment: "Master Health Checkup",
    quote:
      "The full-body checkup caught an issue early that could have become serious. I'm grateful for how thorough and efficient the process was.",
  },
];
