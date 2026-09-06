import owl from "./assets/academy-art/wind-atelier/owl.webp";
import cat from "./assets/academy-art/wind-atelier/cat.webp";
import mint from "./assets/academy-art/wind-atelier/mint.webp";
import night from "./assets/academy-art/wind-atelier/night.webp";
import book from "./assets/academy-art/wind-atelier/belt-journal.webp";
import satchel from "./assets/academy-art/wind-atelier/satchel.webp";
export { default as ATELIER_SCENE } from "./assets/academy-art/wind-atelier/terrace.webp";
export const ATELIER_OUTFITS = {
  top_mint: { poster: mint },
  top_starlight: { poster: night },
};
export const ATELIER_ITEMS = {
  top_mint: mint,
  top_starlight: night,
  prop_book: book,
  prop_satchel: satchel,
};
// Catalog thumbnails; fitted hats are part of the registered head variants below.
export const ATELIER_ATTACHMENTS = {
  prop_book: { src: book, handInFront: false },
  prop_satchel: { src: satchel, handInFront: true },
};

export { default as ATELIER_SCENE_MOTION } from "./assets/academy-art/wind-atelier/terrace-living.mp4";

export const ATELIER_FRIENDS = { owl, cat };

import rig_female_short from "./assets/academy-art/wind-atelier/rig-female-short.webp";
import rig_female_beret from "./assets/academy-art/wind-atelier/rig-female-beret.webp";
import rig_female_ribbon from "./assets/academy-art/wind-atelier/rig-female-ribbon.webp";
import rig_female_braid from "./assets/academy-art/wind-atelier/rig-female-braid.webp";
import rig_female_braid_beret from "./assets/academy-art/wind-atelier/rig-female-braid-beret.webp";
import rig_female_braid_ribbon from "./assets/academy-art/wind-atelier/rig-female-braid-ribbon.webp";
import rig_male_short from "./assets/academy-art/wind-atelier/rig-male-short.webp";
import rig_male_beret from "./assets/academy-art/wind-atelier/rig-male-beret.webp";
import rig_male_ribbon from "./assets/academy-art/wind-atelier/rig-male-ribbon.webp";
import rig_male_braid from "./assets/academy-art/wind-atelier/rig-male-braid.webp";
import rig_male_braid_beret from "./assets/academy-art/wind-atelier/rig-male-braid-beret.webp";
import rig_male_braid_ribbon from "./assets/academy-art/wind-atelier/rig-male-braid-ribbon.webp";
import rig_female_blink from "./assets/academy-art/wind-atelier/rig-female-blink.webp";
import rig_male_blink from "./assets/academy-art/wind-atelier/rig-male-blink.webp";
import rig_male from "./assets/academy-art/wind-atelier/rig-male.webp";
import rig_male_night from "./assets/academy-art/wind-atelier/rig-male-night.webp";

const HEADS = {
  female: {
    hair_chestnut: {
      none: rig_female_short,
      hat_beret: rig_female_beret,
      hat_ribbon: rig_female_ribbon,
    },
    hair_braid: {
      none: rig_female_braid,
      hat_beret: rig_female_braid_beret,
      hat_ribbon: rig_female_braid_ribbon,
    },
  },
  male: {
    hair_chestnut: {
      none: rig_male_short,
      hat_beret: rig_male_beret,
      hat_ribbon: rig_male_ribbon,
    },
    hair_braid: {
      none: rig_male_braid,
      hat_beret: rig_male_braid_beret,
      hat_ribbon: rig_male_braid_ribbon,
    },
  },
};
const RIGS = {
  female: {
    headClip:
      "M0 0 H800 V390 H541 L533 382 Q493 384 450 402 L432 403 L435 430 H0 Z",
    neckPivot: "865px 466px",
    hands: {
      top_mint:
        "M817 923 L819 933 L831 940 L833 940 L833 938 L823 932 L824 931 L839 929 L857 923 L867 926 L877 931 L880 934 L874 936 L865 936 L858 938 L855 937 L850 939 L847 942 L836 940 L836 942 L844 944 L829 958 L824 959 L815 969 L809 972 L808 976 L811 979 L815 980 L816 984 L818 985 L832 984 L833 985 L833 999 L836 999 L838 997 L838 994 L836 992 L836 984 L835 983 L865 968 L884 967 L885 966 L891 966 L892 967 L890 969 L873 973 L862 980 L844 988 L840 991 L840 995 L847 997 L854 996 L864 993 L878 986 L882 986 L885 984 L888 985 L902 985 L909 991 L926 996 L941 1008 L953 1013 L956 1010 L959 1009 L962 1010 L964 1007 L970 1004 L976 1003 L976 1001 L984 996 L986 993 L990 997 L993 997 L984 974 L974 964 L971 964 L968 961 L965 961 L962 959 L955 960 L954 959 L956 955 L959 956 L959 954 L954 952 L951 953 L946 952 L945 954 L942 954 L932 946 L929 945 L928 942 L926 942 L925 940 L920 938 L918 935 L913 933 L909 927 L901 922 L896 922 L895 920 L892 921 L865 908 L856 908 L846 913 L836 916 L829 920 L825 920 L822 922 Z",
      top_starlight:
        "M816 926 L817 929 L826 931 L827 930 L839 929 L861 922 L880 933 L879 934 L853 936 L826 959 L824 959 L810 971 L811 977 L814 978 L816 980 L816 982 L806 988 L816 994 L819 993 L820 995 L822 995 L822 993 L820 992 L823 990 L823 986 L826 985 L827 986 L826 990 L831 1000 L841 999 L840 997 L841 996 L854 996 L868 991 L875 987 L885 984 L896 984 L898 983 L916 993 L926 996 L942 1008 L946 1008 L953 1011 L961 1011 L966 1010 L971 1007 L974 1007 L978 1004 L978 1002 L980 1000 L984 999 L991 992 L985 977 L983 976 L981 971 L976 965 L970 960 L962 955 L958 955 L953 957 L947 954 L927 940 L924 940 L923 937 L920 937 L919 934 L916 934 L915 931 L912 931 L909 927 L907 927 L901 922 L889 919 L878 913 L867 905 L860 904 L841 914 L837 915 L835 917 L826 919 L821 922 L818 922 Z",
    },
    prop: {
      x: 770,
      y: 905,
      width: 260,
      height: 265,
      angle: -8,
    },
    eyes: [
      [383, 294, 30, 21, -18],
      [485, 265, 31, 24, -15],
    ],
  },
  male: {
    headClip:
      "M0 0 H800 V366 H494 L489 365 L484 375 L424 412 L405 424 L379 391 L371 383 H0 Z",
    neckPivot: "837px 478px",
    hands: {
      top_mint:
        "M836 987 L836 988 L839 989 L838 993 L840 997 L842 998 L853 998 L865 992 L886 984 L892 984 L912 992 L899 997 L887 999 L882 1002 L851 1026 L833 1046 L833 1051 L839 1055 L844 1056 L842 1058 L842 1062 L845 1065 L853 1066 L864 1061 L869 1057 L897 1041 L921 1034 L929 1034 L930 1035 L924 1039 L907 1046 L875 1069 L872 1072 L872 1077 L875 1076 L877 1079 L886 1078 L913 1064 L935 1055 L944 1055 L970 1062 L971 1065 L974 1065 L975 1063 L976 1066 L980 1066 L981 1064 L984 1064 L985 1067 L989 1067 L990 1065 L992 1067 L995 1067 L996 1064 L997 1066 L1004 1064 L1005 1062 L1007 1062 L1007 1060 L1009 1058 L1012 1058 L1012 1056 L1016 1053 L1017 1058 L1020 1057 L1022 1058 L1025 1054 L1009 1026 L988 999 L950 983 L915 973 L888 959 L877 960 L870 962 Z",
      top_starlight:
        "M837 992 L837 996 L840 999 L844 1000 L850 1000 L856 998 L886 984 L894 984 L902 988 L905 988 L906 990 L910 992 L901 996 L889 998 L882 1002 L851 1026 L833 1046 L833 1051 L836 1054 L845 1054 L846 1055 L842 1059 L842 1062 L844 1064 L849 1066 L856 1066 L857 1065 L860 1066 L860 1072 L862 1079 L874 1076 L877 1079 L882 1079 L935 1055 L951 1056 L954 1058 L963 1059 L970 1062 L982 1063 L983 1064 L1001 1064 L1013 1056 L1014 1057 L1018 1056 L1017 1053 L1019 1051 L1021 1057 L1025 1054 L1009 1026 L988 999 L950 983 L915 973 L894 962 L888 961 L887 963 L884 963 L854 979 L853 975 L852 975 L843 982 L845 985 Z",
    },
    prop: {
      x: 800,
      y: 978,
      width: 260,
      height: 265,
      angle: -8,
    },
    eyes: [
      [358, 266, 27, 17, -7],
      [451, 258, 28, 18, -4],
    ],
  },
};

export function atelierCharacter(look = {}) {
  const sex = look.body === "body_male" ? "male" : "female";
  const top = look.top === "top_starlight" ? "top_starlight" : "top_mint";
  const hair = look.hair === "hair_braid" ? "hair_braid" : "hair_chestnut";
  return {
    ...RIGS[sex],
    sex,
    top,
    hair,
    poster:
      sex === "female"
        ? ATELIER_OUTFITS[top].poster
        : top === "top_mint"
          ? rig_male
          : rig_male_night,
    head: HEADS[sex][hair][look.hat] ?? HEADS[sex][hair].none,
    hand: RIGS[sex].hands[top],
    blink:
      hair === "hair_braid"
        ? sex === "female"
          ? rigFemaleBraidBlink
          : rigMaleBraidBlink
        : sex === "female"
          ? rig_female_blink
          : rig_male_blink,
  };
}

import rigFemaleBraidBlink from "./assets/academy-art/wind-atelier/rig-female-braid-blink.webp";
import rigMaleBraidBlink from "./assets/academy-art/wind-atelier/rig-male-braid-blink.webp";

// The tab at the top of the journal connects to the waist of each outfit.
// A belt-mounted item does not reuse the hand-on-hip occlusion mask.
const BOOK_FITTINGS = {
  female: {
    top_mint: { x: 575, y: 914, width: 205, height: 314, angle: 5 },
    top_starlight: { x: 590, y: 875, width: 195, height: 298, angle: -4 },
  },
  male: {
    top_mint: { x: 620, y: 1028, width: 210, height: 321, angle: 3 },
    top_starlight: { x: 580, y: 1008, width: 205, height: 314, angle: 3 },
  },
};
export function characterAttachment(outfit, look) {
  const item = ATELIER_ATTACHMENTS[look?.prop];
  if (!item) return null;
  return {
    ...item,
    ...(look.prop === "prop_book"
      ? BOOK_FITTINGS[outfit.sex][outfit.top]
      : outfit.prop),
  };
}
