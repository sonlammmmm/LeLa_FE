import { motion, useReducedMotion } from "motion/react";
import { Brain, Target, CalendarDays } from "lucide-react";

export function BentoFeatures() {
  const reduce = useReducedMotion();

  return (
    <section className="w-full py-24 border-y-[3px] border-brand-black relative">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="mb-16 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-brand-navy mb-4">
            Được thiết kế để bạn nhớ lâu nhất.
          </h2>
          <p className="text-lg font-medium text-brand-navy/80">
            Học ít thời gian hơn nhưng mang lại hiệu quả cao hơn. Chúng tôi tập trung vào 
            những công cụ thực sự giúp não bộ ghi nhớ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Cell 1: Large (Col-span 2) */}
          <motion.div 
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2 brutal-card overflow-hidden flex flex-col md:flex-row bg-white hover:-translate-y-2"
          >
            <div className="p-8 md:p-10 flex-1 flex flex-col justify-center">
              <div className="w-14 h-14 bg-brand-teal brutal-border brutal-shadow-sm brutal-pill flex items-center justify-center mb-6">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-brand-navy mb-3">
                Lặp lại ngắt quãng (SRS)
              </h3>
              <p className="text-brand-navy/80 font-medium">
                Thuật toán tự động tính toán thời điểm hoàn hảo nhất để nhắc nhở bạn ôn tập từ vựng, 
                ngay trước khi bạn chuẩn bị quên nó.
              </p>
            </div>
            <div className="flex-1 bg-brand-teal/10 p-6 flex items-center justify-center border-t-[3px] md:border-t-0 md:border-l-[3px] border-brand-black">
              <img 
                src="/images/bento_srs_graph.png" 
                alt="Biểu đồ thuật toán SRS" 
                className="w-full h-auto max-w-[280px] bg-white brutal-card"
              />
            </div>
          </motion.div>

          {/* Cell 2: Small */}
          <motion.div 
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="brutal-card p-8 bg-[#FFE885] flex flex-col justify-between hover:-translate-y-2"
          >
            <div>
              <div className="w-14 h-14 bg-white brutal-border brutal-shadow-sm brutal-pill flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-brand-navy" />
              </div>
              <h3 className="text-2xl font-bold text-brand-navy mb-3">
                Bài thi tính giờ
              </h3>
              <p className="text-brand-navy/80 font-medium">
                Thử thách bản thân với các bài trắc nghiệm nhanh, tự động chấm điểm để đánh giá năng lực thực tế.
              </p>
            </div>
          </motion.div>

          {/* Cell 3: Small */}
          <motion.div 
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="brutal-card p-8 bg-brand-coral flex flex-col justify-between hover:-translate-y-2"
          >
            <div>
              <div className="w-14 h-14 bg-white brutal-border brutal-shadow-sm brutal-pill flex items-center justify-center mb-6">
                <CalendarDays className="w-7 h-7 text-brand-navy" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Theo dõi tiến độ
              </h3>
              <p className="text-white/90 font-medium">
                Duy trì chuỗi ngày học liên tục (Streak) và xem Heatmap đóng góp để không ngừng tạo động lực.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
