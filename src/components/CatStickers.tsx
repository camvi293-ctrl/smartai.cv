import React from 'react';

export interface CatStickerData {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  tag: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  moodQuote: string;
  image: string;
  index: number;
  row: number;
  col: number;
}

export const CAT_STICKERS: CatStickerData[] = [
  // ROW 1
  {
    id: 'heart_eyes_gray',
    name: 'Gray Red Heart-Eyes Tabby',
    nameVi: 'Mèo Xám Mắt Tim Đỏ',
    description: 'Bộ lông xám sọc vằn với đôi mắt trái tim màu đỏ rực rỡ',
    tag: 'Mắt Tim',
    accentColor: '#FF6B81',
    badgeBg: 'bg-[#FFF0F3] text-[#FF6B81] border-[#FFCCD5]',
    badgeText: 'Love ❤️',
    moodQuote: 'Meow~ Nhìn thấy deadline mà vẫn yêu đời như nhìn thấy đĩa cá rán! 💕',
    image: '/cats/cat-1.png',
    index: 1,
    row: 1,
    col: 1,
  },
  {
    id: 'siamese_sparkle',
    name: 'Ivory White Brown Mask Siamese',
    nameVi: 'Mèo Trắng Mặt Nạ Nâu',
    description: 'Thân trắng ngà quý phái với mặt nạ nâu sô-cô-la và đôi mắt long lanh',
    tag: 'Mặt Nạ Nâu',
    accentColor: '#a855f7',
    badgeBg: 'bg-[#FFF0F3] text-[#FF6B81] border-[#FFCCD5]',
    badgeText: 'Chic ✨',
    moodQuote: 'Một quý cô mèo luôn hoàn thành mọi việc đúng giờ và chuẩn chỉ!',
    image: '/cats/cat-2.png',
    index: 2,
    row: 1,
    col: 2,
  },
  {
    id: 'sad_black_kitten',
    name: 'Slate Black Teary Puppy-Eyes Kitten',
    nameVi: 'Mèo Đen Mắt Cún Rưng Rưng',
    description: 'Bộ lông đen than với đôi mắt cún con ươn ướt dễ thương',
    tag: 'Mắt Cún 🥺',
    accentColor: '#64748b',
    badgeBg: 'bg-[#FFF0F3] text-[#FF6B81] border-[#FFCCD5]',
    badgeText: 'Soft 🥺',
    moodQuote: 'Sen ơi, mình làm xong việc này rồi cùng đi ăn xúc xích nha...',
    image: '/cats/cat-3.png',
    index: 3,
    row: 1,
    col: 3,
  },
  {
    id: 'ginger_tabby_smile',
    name: 'Ginger Orange Striped Smiling Cat',
    nameVi: 'Mèo Vàng Sọc Vằn Cười Tươi',
    description: 'Lông vàng cam ấm áp, sọc hổ tươi vui và đuôi cong vắt sang trái',
    tag: 'Cười Tươi ☀️',
    accentColor: '#f97316',
    badgeBg: 'bg-[#FFF0F3] text-[#FF6B81] border-[#FFCCD5]',
    badgeText: 'Sunny ☀️',
    moodQuote: 'Cười tươi lên nào! Hôm nay nhất định sẽ là một ngày rực rỡ!',
    image: '/cats/cat-4.png',
    index: 4,
    row: 1,
    col: 4,
  },

  // ROW 2
  {
    id: 'anime_eyes_shadow',
    name: 'Midnight Black Big Round Eyes Kitten',
    nameVi: 'Mèo Đen Mắt Tròn Xoe Chấm Sáng',
    description: 'Thân đen mun huyền bí với đôi mắt to tròn xoe 2 chấm sáng và râu trắng',
    tag: 'Mắt Tròn (O_O)',
    accentColor: '#0ea5e9',
    badgeBg: 'bg-[#FFF0F3] text-[#FF6B81] border-[#FFCCD5]',
    badgeText: 'Curious 👀',
    moodQuote: 'Mắt mèo mở to 200% để soi từng chi tiết không để sót task nào!',
    image: '/cats/cat-5.png',
    index: 5,
    row: 2,
    col: 1,
  },
  {
    id: 'winking_calico',
    name: 'White Orange-Patched Squinting Joyful Cat',
    nameVi: 'Mèo Trắng Đốm Cam Tít Mắt',
    description: 'Thân trắng đốm cam tai phải, tít mắt cười hoan hỷ hình vòng cung',
    tag: 'Tít Mắt (^-^)',
    accentColor: '#ec4899',
    badgeBg: 'bg-[#FFF0F3] text-[#FF6B81] border-[#FFCCD5]',
    badgeText: 'Joyful 😄',
    moodQuote: 'Cười tươi như hoa, mọi âu lo đều tan biến hết!',
    image: '/cats/cat-6.png',
    index: 6,
    row: 2,
    col: 2,
  },
  {
    id: 'striped_silver_gentle',
    name: 'Silver Striped White-Bib Tabby',
    nameVi: 'Mèo Xám Bạc Sọc Vằn Yếm Trắng',
    description: 'Vằn sọc xám bạc thanh tao, yếm ngực trắng và nụ cười chúm chím',
    tag: 'Yếm Trắng 🌿',
    accentColor: '#10b981',
    badgeBg: 'bg-[#FFF0F3] text-[#FF6B81] border-[#FFCCD5]',
    badgeText: 'Calm 🌿',
    moodQuote: 'Tập trung nhịp nhàng, tâm an vạn sự đều hanh thông.',
    image: '/cats/cat-7.png',
    index: 7,
    row: 2,
    col: 3,
  },
  {
    id: 'calico_patch_sweet',
    name: 'White Two-Tone Ears Spotted Calico',
    nameVi: 'Mèo Trắng Tai Nâu Đen Đốm Thân',
    description: 'Tai nâu tai đen, thân lấm tấm đốm mực tinh nghịch nháy mắt',
    tag: 'Đốm Thân 🐾',
    accentColor: '#84cc16',
    badgeBg: 'bg-[#FFF0F3] text-[#FF6B81] border-[#FFCCD5]',
    badgeText: 'Playful 🐾',
    moodQuote: 'Mỗi ngày là một chuyến phiêu lưu mới đầy màu sắc!',
    image: '/cats/cat-8.png',
    index: 8,
    row: 2,
    col: 4,
  },

  // ROW 3
  {
    id: 'sparkling_brown_spot',
    name: 'White Brown-Spotted Sparkling Star Eyes Cat',
    nameVi: 'Mèo Trắng Đốm Nâu Mắt Sao Lấp Lánh',
    description: 'Thân trắng đốm caramel với đôi mắt ngời sao sáng lấp lánh như ngọc bích',
    tag: 'Mắt Sao ✨',
    accentColor: '#d97706',
    badgeBg: 'bg-[#FFF0F3] text-[#FF6B81] border-[#FFCCD5]',
    badgeText: 'Sparkle 🌟',
    moodQuote: 'Tỏa sáng như những vì sao trên bầu trời đêm!',
    image: '/cats/cat-9.png',
    index: 9,
    row: 3,
    col: 1,
  },
  {
    id: 'determined_gray_brow',
    name: 'Light Gray Fierce Brows Determined Kitty',
    nameVi: 'Mèo Xám Nhạt Lông Mày Xếch',
    description: 'Lông xám nhạt với vệt trán đậm, lông mày nhíu xếch quyết tâm dẹp deadline',
    tag: 'Mày Xếch (\\ /)',
    accentColor: '#6366f1',
    badgeBg: 'bg-[#FFF0F3] text-[#FF6B81] border-[#FFCCD5]',
    badgeText: 'Focus ⚡',
    moodQuote: 'Hôm nay nhất định phải xong hết mục tiêu, không chần chừ!',
    image: '/cats/cat-10.png',
    index: 10,
    row: 3,
    col: 2,
  },
  {
    id: 'blushing_choco',
    name: 'Chocolate Brown Round Rosy Cheeks Cat',
    nameVi: 'Mèo Nâu Má Hồng Tròn Xoe',
    description: 'Lông nâu sô-cô-la xù phúng phính với hai bên má ửng hồng tròn xoe ngọt ngào',
    tag: 'Má Hồng 🌸',
    accentColor: '#f43f5e',
    badgeBg: 'bg-[#FFF0F3] text-[#FF6B81] border-[#FFCCD5]',
    badgeText: 'Sweet 🌸',
    moodQuote: 'Ngọt ngào như một ly trà sữa ấm áp ngày đông.',
    image: '/cats/cat-11.png',
    index: 11,
    row: 3,
    col: 3,
  },
  {
    id: 'sweet_orange_calico',
    name: 'White Left-Ear Orange Patch Winking Cat',
    nameVi: 'Mèo Trắng Đốm Cam Nháy Mắt',
    description: 'Thân trắng tai trái đốm cam, một mắt nháy tinh nghịch tràn đầy tự tin',
    tag: 'Nháy Mắt (^.<)',
    accentColor: '#ea580c',
    badgeBg: 'bg-[#FFF0F3] text-[#FF6B81] border-[#FFCCD5]',
    badgeText: 'Wink 😉',
    moodQuote: 'Nháy mắt một cái là việc khó cũng hóa thành dễ ợt!',
    image: '/cats/cat-12.png',
    index: 12,
    row: 3,
    col: 4,
  },

  // ROW 4
  {
    id: 'smirking_gray_sly',
    name: 'Dark Gray Side-Eye Smirking Kitty',
    nameVi: 'Mèo Xám Liếc Mắt Ngang Sành Điệu',
    description: 'Lông xám đậm với ánh mắt liếc ngang tinh quái và nụ cười mỉm dí dỏm',
    tag: 'Liếc Ngang (¬_¬)',
    accentColor: '#059669',
    badgeBg: 'bg-[#FFF0F3] text-[#FF6B81] border-[#FFCCD5]',
    badgeText: 'Smart 🧠',
    moodQuote: 'Biết tuốt mọi ngóc ngách để tối ưu hóa quỹ thời gian!',
    image: '/cats/cat-13.png',
    index: 13,
    row: 4,
    col: 1,
  },
  {
    id: 'chubby_garfield_stripes',
    name: 'Orange Tabby Chubby Belly Squinting Cat',
    nameVi: 'Mèo Vàng Cam Bụng Bự Mắt Lim Dim',
    description: 'Lông vàng cam mập tròn núc ních, ngấn bụng múp míp và mắt lim dim thư giãn',
    tag: 'Bụng Bự (-_-)',
    accentColor: '#f59e0b',
    badgeBg: 'bg-[#FFF0F3] text-[#FF6B81] border-[#FFCCD5]',
    badgeText: 'Chill 🍵',
    moodQuote: 'Làm việc chăm chỉ rồi tận hưởng giấc ngủ trưa thật đã.',
    image: '/cats/cat-14.png',
    index: 14,
    row: 4,
    col: 2,
  },
  {
    id: 'snow_white_happy',
    name: 'Pure Snow White Smiling Cat',
    nameVi: 'Mèo Trắng Tuyết Miệng Cười Chúm Chím',
    description: 'Toàn thân trắng tinh khôi thanh thuần, viền nét rõ và miệng cười chúm chím',
    tag: 'Trắng Tuyết 🤍',
    accentColor: '#ec4899',
    badgeBg: 'bg-[#FFF0F3] text-[#FF6B81] border-[#FFCCD5]',
    badgeText: 'Happy 🤍',
    moodQuote: 'Sự thuần khiết mang lại tinh thần sảng khoái suốt cả ngày.',
    image: '/cats/cat-15.png',
    index: 15,
    row: 4,
    col: 3,
  },
  {
    id: 'nervous_sweat_kitty',
    name: 'Earthy Brown Forehead Sweat Drop Kitty',
    nameVi: 'Mèo Nâu Toát Mồ Hôi Trán',
    description: 'Lông nâu xám đất, mắt mở to tròn xoe kèm giọt mồ hôi nhấp nháy trên trán',
    tag: 'Mồ Hôi (😰)',
    accentColor: '#ef4444',
    badgeBg: 'bg-[#FFF0F3] text-[#FF6B81] border-[#FFCCD5]',
    badgeText: 'Urgent 💦',
    moodQuote: 'Deadline tới nơi rồi! Bình tĩnh hít một hơi thật sâu rồi bắt đầu nào!',
    image: '/cats/cat-16.png',
    index: 16,
    row: 4,
    col: 4,
  },
];

export const getCatById = (id: string): CatStickerData => {
  return CAT_STICKERS.find((c) => c.id === id) || CAT_STICKERS[0];
};

export const getCatByIndex = (index: number): CatStickerData => {
  return CAT_STICKERS[index - 1] || CAT_STICKERS[0];
};

interface CatStickerProps {
  catId?: string;
  stickerId?: string;
  size?: number | string;
  className?: string;
  animated?: boolean;
  onClick?: () => void;
  alt?: string;
}

/**
 * Standard Cat Sticker Image Component using pure PNG <img>
 * Configured with object-fit: contain to ensure natural display without distortion or cutoffs.
 */
export const CatSticker: React.FC<CatStickerProps> = ({
  catId,
  stickerId,
  size = 64,
  className = '',
  animated = false,
  onClick,
  alt,
}) => {
  const targetId = catId || stickerId || 'heart_eyes_gray';
  const cat = getCatById(targetId);
  const sizeStyle = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : { width: size, height: size };

  return (
    <div
      style={sizeStyle}
      className={`inline-flex items-center justify-center relative flex-shrink-0 select-none ${
        animated ? 'cat-interactive' : ''
      } ${className}`}
      onClick={onClick}
    >
      <img
        src={cat.image}
        alt={alt || cat.nameVi}
        className="w-full h-full object-contain pointer-events-none drop-shadow-sm transition-transform duration-200"
        loading="lazy"
        onError={(e) => {
          // Fallback to root /cat-X.png if needed
          const target = e.currentTarget;
          if (!target.src.includes(`/cat-${cat.index}.png`)) {
            target.src = `/cat-${cat.index}.png`;
          }
        }}
      />
    </div>
  );
};

export default CatSticker;
