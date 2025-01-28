using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataLoadService.Common
{
    internal class Topic : Base
    {
        public string TopicName { get; set; }
        public string TopicDescription { get; set; } = string.Empty;
    }
}
