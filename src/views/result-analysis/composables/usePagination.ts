import { ref, computed, type Ref } from "vue";

// T可以是一个泛型，使其更具可复用性
export function usePagination<T>(data: Ref<T[]>) {
  const currentPage = ref(1);
  const pageSize = ref(10);
  const jumpToPage = ref("");

  const totalPages = computed(() => {
    return Math.ceil(data.value.length / pageSize.value) || 1;
  });

  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return data.value.slice(start, end);
  });

  const displayedPages = computed(() => {
    const result: (number | string)[] = [];
    const maxDisplayed = 5;

    if (totalPages.value <= maxDisplayed) {
      for (let i = 1; i <= totalPages.value; i++) {
        result.push(i);
      }
    } else {
      result.push(1);

      let startPage = Math.max(2, currentPage.value - 1);
      let endPage = Math.min(totalPages.value - 1, currentPage.value + 1);

      if (currentPage.value < 3) {
        endPage = 3;
      }
      if (currentPage.value > totalPages.value - 2) {
        startPage = totalPages.value - 2;
      }

      if (startPage > 2) {
        result.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        result.push(i);
      }

      if (endPage < totalPages.value - 1) {
        result.push("...");
      }

      result.push(totalPages.value);
    }

    return result;
  });

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  };

  const handlePageSizeChange = () => {
    currentPage.value = 1;
    jumpToPage.value = "";
  };

  const handleJumpToPage = () => {
    const page = parseInt(jumpToPage.value);
    if (!isNaN(page) && page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
    jumpToPage.value = "";
  };

  // 当筛选条件变化导致总页数减少时，确保当前页不会超出范围
  const resetCurrentPageIfNeeded = () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value;
    }
  };

  return {
    currentPage,
    pageSize,
    jumpToPage,
    totalPages,
    paginatedData,
    displayedPages,
    goToPage,
    handlePageSizeChange,
    handleJumpToPage,
    resetCurrentPageIfNeeded,
  };
}
