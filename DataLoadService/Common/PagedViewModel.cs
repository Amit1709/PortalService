using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataLoadService.Common
{
    internal class PagedViewModel<T>
    {
        const int DefaultPageSize = 10;
        const int DefaultPageNumber = 1;

        public PagedViewModel(IQueryable<T> allResults, int pageNumber, int pageSize)
        {
            if (pageNumber == 0)
            {
                pageNumber = DefaultPageNumber;
            }
            if (pageSize == 0)
            {
                pageSize = DefaultPageSize;
            }
            if (pageSize == -1)
            {
                pageSize = allResults.Count();
                pageNumber = 1;
            }
            Data = allResults
                .Skip(pageSize * (pageNumber - 1))
                .Take(pageSize).ToList();

            Pagination.TotalCount = allResults.Count();
            Pagination.TotalPages = (int)Math.Ceiling(Pagination.TotalCount / (double)pageSize);
            Pagination.PageSize = pageSize;
            Pagination.CurrentPage = pageNumber;

        }
        public List<T> Data { get; private set; } = new List<T>();
        public Pagination Pagination { get; private set; } = new Pagination();

        //public List<ExceptionDetails> ExceptionDetails { get; set; } = new List<ExceptionDetails>();
    }
}
