/**
 * 业务模拟数据生成工具集。
 *
 * 本模块提供符合真实规则的教育场景模拟数据生成能力，可生成中文姓名、
 * 教学楼名称、中国大陆身份证号码以及中国大陆手机号码。所有生成器均继承自
 * {@link Mock.RealityElement}，并遵循统一的 `wantOne` / `want` 调用契约。
 *
 * 生成的数据可用于页面演示、测试数据填充、报表造数等开发场景。
 *
 * @summary 业务模拟数据生成工具集。
 *
 * @since 26.7.1
 *
 * @example
 * ```js
 * const name = Mock.PersonalName.of().wantOne()
 * const names = Mock.PersonalName.of().want(10)
 * const idCard = Mock.ID.of().wantOne()
 * ```
 */
export namespace Mock {
  /**
   * 模拟数据生成器的抽象基类。
   *
   * 本抽象类定义了模拟数据生成器的基础行为。子类需实现 {@link RealityElement.wantOne}
   * 方法以提供单条数据的生成逻辑；{@link RealityElement.want} 方法则基于
   * `wantOne` 批量生成指定数量的数据。
   *
   * @summary 模拟数据生成器的抽象基类。
   *
   * @since 26.7.1
   * @see {@link Mock.PersonalName}
   * @see {@link Mock.Building}
   * @see {@link Mock.ID}
   * @see {@link Mock.Tel}
   */
  export abstract class RealityElement {
    /**
     * 创建一个新的模拟数据生成器实例。
     *
     * @summary 创建一个新的模拟数据生成器实例。
     *
     * @typeParam T 具体的生成器子类类型。
     * @returns 初始化后的生成器实例。
     * @since 26.7.1
     */
    static of<T extends RealityElement>(this: new () => T) {
      return new this()
    }

    /**
     * 从给定字符串中随机截取一个子串。
     *
     * 该方法按照指定的单元长度从字符串中随机截取一段内容，常用于从预定义的
     * 字符池中随机选取元素。截取起始位置根据字符串长度与单元长度计算得出。
     *
     * @summary 从给定字符串中随机截取一个子串。
     *
     * @param arr 用于截取的源字符串。
     * @param unitlen 截取单元长度，默认为 `1`，即每次截取一个字符。
     * @returns 截取得到的子串。
     * @protected
     * @since 26.7.1
     */
    protected slice(arr: string, unitlen = 1) {
      const i = Math.floor(Math.random() * (arr.length / unitlen))
      return arr.slice(i * unitlen, i * unitlen + unitlen)
    }

    /**
     * 生成一条模拟数据。
     *
     * 子类必须重写此方法以实现具体的数据生成逻辑。默认实现抛出
     * `Method not implemented.` 错误。
     *
     * @summary 生成一条模拟数据。
     *
     * @returns 生成的单条模拟数据字符串。
     * @throws {Error} 当子类未实现此方法时抛出。
     * @since 26.7.1
     */
    wantOne(): string {
      throw new Error("Method not implemented.")
    }

    /**
     * 批量生成模拟数据。
     *
     * 该方法通过循环调用 {@link RealityElement.wantOne} 生成指定数量的数据项。
     *
     * @summary 批量生成模拟数据。
     *
     * @param num 需要生成的数据项数量。
     * @returns 包含生成结果的字符串数组。
     * @since 26.7.1
     */
    want(num: number) {
      const result: string[] = []
      for (let i = 0; i < num; i++) {
        result.push(this.wantOne())
      }
      return result
    }
  }

  /**
   * 随机中文姓名生成器。
   *
   * 该生成器从预定义的姓氏库与常用名字库中随机组合生成中文姓名。
   * 姓氏为单个汉字，名字由 1 到 2 个汉字组成，其中两字名字的概率较高。
   *
   * @summary 随机中文姓名生成器。
   *
   * @since 26.7.1
   * @extends {Mock.RealityElement}
   *
   * @example
   * ```js
   * Mock.PersonalName.of().wantOne() // 例如 "王梓轩"
   * ```
   */
  export class PersonalName extends RealityElement {
    // length: 1 * 100
    private static f =
      "王李张刘陈杨黄赵吴周徐孙马朱胡林郭何高罗郑梁谢宋唐许韩冯邓曹彭曾肖田董袁潘于蒋蔡余杜叶程苏魏吕丁任沈姚卢姜崔钟谭陆汪范金石廖贾夏韦傅方白邹孟熊秦邱江尹薛闫段雷侯龙史陶黎贺顾毛郝邵万钱严武孔向常温康施文"
    // length: 2 * 900
    private static l =
      "梓轩雨桐浩然语欣子涵欣怡俊熙梦瑶一诺宇泽晨宇若曦泽宇欣悦梓涵雨泽思涵诗琪宇辰馨悦宸宇佳怡皓轩雨欣子轩依诺浩宇佳琪辰宇欣妍泽轩语桐俊豪馨怡梓豪雨萱思琪语萱宇轩若彤皓宇雅欣子豪梦琪浩轩思怡辰轩若欣泽辰诗涵宇豪佳欣俊宇梦瑶梓辰雨欣子辰馨琪浩辰欣彤宸轩依彤皓宸雨桐子豪诺一浩泽佳彤辰皓欣琪泽豪语馨俊辰馨彤梓熙雨诺思诺语琪宇皓若萱皓轩雅彤子熙梦萱浩熙思彤辰泽若琪泽熙诗悦宇辰佳诺俊泽梦欣梓泽雨彤子琪馨诺浩琪欣泽博文志强嘉豪伟宸昊然天佑文昊修杰楷瑞建辉晋鹏辰逸瑾瑜皓轩擎苍擎宇致远烨磊晟睿文博天佑英杰弘文烨伟苑博鹏涛炎彬鹤轩君昊熠彤鸿煊博涛烨霖哲瀚雨泽楷瑞建辉致远俊驰雨泽烨磊晟睿文博天佑英杰弘文烨伟苑博鹏涛炎彬鹤轩君昊熠彤鸿煊博涛烨霖哲瀚鑫鹏致远俊驰明杰立诚立轩立辉峻熙弘文熠彤鸿煊烨霖哲瀚楷瑞建辉晋鹏天磊绍辉泽洋鑫磊鹏煊昊强伟宸博超君浩子骞明辉天翊俊楠鸿涛伟祺荣轩越泽浩宇瑾瑜皓轩擎苍擎宇志泽睿渊楷瑞轩辰泽凯雨嘉欣妍瑾萱漫妮语嫣桑榆歆瑶凌菲靖瑶瑾萱诗茵琪涵倩雪莉姿梦璐灵芸晓萱雪雁煜婷羽馨靖瑶瑾萱漫妮欣妍玉珍茹雪正梅美琳欢馨优璇雨嘉娅楠明美可馨惠茜漫妮香茹月婵嫦曦静香梦洁凌薇美莲雅静雪丽依娜雅芙雨婷怡香珺瑶梦瑶婉婷睿婕雅琳静琪彦妮馨蕊静宸淑颖乐姗玥婷芸熙钰彤璟雯天瑜婧琪静宸雨嘉欣妍瑾萱漫妮语嫣桑榆歆瑶凌菲靖瑶瑾萱诗茵琪涵倩雪莉姿梦璐灵芸晓萱雪雁煜婷羽馨思欣语琴紫涵雨婷佳怡欣悦思琪语萱若彤馨怡雅欣梦琪思怡沐晨清然书瑶景行知予念希星榆云舒晚晴亦安初雪知夏时雨清禾书泽星然云溪晚星亦辰初晨知乐时安清越书瑶星宇云帆晚柠亦欣初瑶知语时玥清瑶书豪星泽云欣晚瑶亦辰初泽知轩时轩清宇书欣星悦云彤晚晴亦彤初欣知诺时诺清诺书辰星琪云琪晚琪亦琪初琪知桐时桐清桐书桐星霖云霖晚霖亦霖初霖知晴时晴清晴书晴星晴云晴晚晴亦晴初晴知阳时阳清阳书阳星阳云阳晚阳亦阳初阳知彤时彤清彤书彤星彤云彤晚彤亦彤初彤知睿时睿清睿书睿星睿云睿晚睿亦睿亦恒之昂予安沐泽念初书桓星辞云深晚舟知年时笙清川书屿星野云舟晚禾亦屿初屿知屿时屿清屿书瑶星瑶云瑶晚瑶亦瑶初瑶知瑶时瑶清瑶书宸星宸云宸晚宸亦宸初宸知宸时宸清宸书泽星泽云泽晚泽亦泽初泽知泽时泽清泽书宇星宇云宇晚宇亦宇初宇知宇时宇清宇书轩星轩云轩晚轩亦轩初轩知轩时轩清轩书豪星豪云豪晚豪亦豪初豪知豪时豪清豪书辰星辰云辰晚辰亦辰初辰知辰时辰清辰书琪星琪云琪晚琪亦琪初琪知琪时琪清琪书彤星彤云彤晚彤亦彤初彤知彤建国建军建华建明建强红梅红霞红英丽华丽娟丽萍秀英桂英桂兰玉兰玉芬玉珍秀兰秀珍秀芳志强志勇志华志明志军卫东卫国卫红晓东晓华晓军晓丽晓燕晓梅晓芳晓明晓峰晓波晓强晓宇海涛海波海峰海燕海英海军红梅红燕红玲红丽永刚永强永军永明永红永生永平永康永胜永辉学军学华学明学强学成学文学武学丽学芳学英文杰文军文涛文丽文芳文英文霞文娟文琪文婷俊杰俊峰俊涛俊丽俊芳俊英俊玲俊燕俊琪俊婷伟杰伟峰伟涛伟丽伟芳伟英伟玲伟燕伟琪伟婷国华国强国军国明国锋国红国芳国英国玲国燕梓豪梓轩梓涵梓辰梓琪梓彤梓欣梓瑶梓诺梓桐一诺依诺诺一欣诺语诺辰诺琪诺彤诺瑶诺桐诺皓宇皓轩皓辰皓琪皓彤皓欣皓瑶皓诺皓桐皓泽宇辰宇轩宇泽宇琪宇彤宇欣宇瑶宇诺宇桐宇豪辰轩辰泽辰琪辰彤辰欣辰瑶辰诺辰桐辰豪辰宇轩泽轩琪轩彤轩欣轩瑶轩诺轩桐轩豪轩宇轩辰泽琪泽彤泽欣泽瑶泽诺泽桐泽豪泽宇泽辰泽轩琪彤琪欣琪瑶琪诺琪桐琪豪琪宇琪辰琪轩琪泽彤欣彤瑶彤诺彤桐彤豪彤宇彤辰彤轩彤泽彤琪欣瑶欣诺欣桐欣豪欣宇欣辰欣轩欣泽欣琪欣彤清欢枕书疏影惊鸿南絮听澜观云寻鹤问松望舒临风踏歌逐月归尘忘忧安歌采苓采薇清扬婉兮景行德音子衿悠悠琼华瑾瑕清晏嘉树承宇振鹭维桢秉文昭华灼华蓁蓁夭夭攸宁绥之思齐怀瑾握瑜沐风栖迟式微鹿鸣笙歌星垂月涌江枫渔火寒山远黛碧落沧溟扶摇桑榆东隅青衿白裳朱颜凝眸浅笑安然若素浮生若梦清尘晚照晴川星河云阶月地晓霜暮雪朝露夜阑风眠云归鹤唳猿啼松涛竹韵梅香兰芷菊影荷风柳烟棠梨杏雨桃夭琴瑟笙箫笔墨纸砚诗酒花茶山水风月春秋朝夕朝阳晨光晓光旭光旭阳晨曦晨辉晨朗晨旭晨阳骄阳暖阳熙阳熙晨熙光熙旭熙辉明朗明亮明光明旭明辉明阳明晨光耀光辉光晨光旭光阳光熙乐阳乐晨乐熙乐辉乐旭乐天乐欣乐彤乐瑶乐琪欣阳欣晨欣熙欣辉欣旭欣光欣明欣朗欣耀欣乐悦阳悦晨悦熙悦辉悦旭悦光悦明悦朗悦耀悦乐畅阳畅晨畅熙畅辉畅旭畅光畅明畅朗畅耀畅乐朗阳朗晨朗熙朗辉朗旭朗光朗明朗耀朗乐朗欣辉阳辉晨辉熙辉旭辉光辉明朗辉耀辉乐辉欣旭阳旭晨旭熙旭辉旭光旭明朗旭耀旭乐旭欣"

    /**
     * 生成一个随机中文姓名。
     *
     * 姓氏从预定义的百家姓字符池中随机选取一个汉字；名字从常用名字库中
     * 随机截取 2 个汉字，并以 90% 的概率保留两字、10% 的概率截取其中一字。
     *
     * @summary 生成一个随机中文姓名。
     *
     * @returns 生成的中文姓名字符串。
     * @since 26.7.1
     */
    override wantOne() {
      return (
        this.slice(PersonalName.f) +
        this.slice(PersonalName.l, 2).slice(0, 1 + Number(Math.random() > 0.1))
      )
    }
  }

  /**
   * 教学楼名称生成器。
   *
   * 该生成器从预定义的教学楼名称字符池中随机截取两个汉字，并拼接“楼”字，
   * 生成例如“文渊楼”、“知新楼”等模拟教学楼名称。
   *
   * @summary 教学楼名称生成器。
   *
   * @since 26.7.1
   * @extends {Mock.RealityElement}
   *
   * @example
   * ```js
   * Mock.Building.of().wantOne() // 例如 "文渊楼"
   * ```
   */
  export class Building extends RealityElement {
    // length: 2 * 100
    private static n =
      "文渊翰墨知新崇文书声典籍学思博文雅韵诗礼文枢翰苑育贤启智明礼崇文修文诵芬文澜智源笃行致远励学勤耕精进自强厚德弘毅恒志励耘思齐笃志力行持恒奋进修远博毅砺志勤朴诚毅松涛竹韵杏坛梅岭兰馨菊香荷风柳岸枫华柏翠桂馨桃蹊杉影竹溪松韵菊苑兰圃梅轩荷苑柳林兰亭岳麓白鹿石鼓楼杏坛洙泗尼山稷下文昌奎星昭明紫阳阳明朱子康成东壁西窗南轩北宸中岳启航博远创新未来卓越融合启迪智慧先锋汇贤聚力腾飞筑梦星耀晨光星辉华章新程领航卓越"

    /**
     * 生成一个模拟教学楼名称。
     *
     * @summary 生成一个模拟教学楼名称。
     *
     * @returns 生成的教学楼名称字符串。
     * @since 26.7.1
     */
    override wantOne() {
      return this.slice(Building.n, 2) + "楼"
    }
  }

  /**
   * 中国大陆身份证号码生成器。
   *
   * 该生成器生成符合中国大陆居民身份证校验规则的 18 位身份证号码。
   * 号码由地址码、出生日期码、顺序码与校验码组成，其中地址码从预定义的
   * 行政区划代码池中随机选取，出生日期在合理范围内随机生成，校验码依据
   * GB 11643-1999 标准的加权求余算法计算。
   *
   * @summary 中国大陆身份证号码生成器。
   *
   * @since 26.7.1
   * @extends {Mock.RealityElement}
   *
   * @example
   * ```js
   * Mock.ID.of().wantOne() // 例如 "110101199001011234"
   * ```
   */
  export class ID extends RealityElement {
    private static a =
      "110101120101310101500101130102130202140105140202150102150202210102210202220102220202230103230202320102320202330106330205340102340202350102350203360102360702370102370202410102410305420102420502430102430202440103440305450102450202460106460202510104510703520102520201530102530202540102540202610102610202620102620202630102632121640104640202650102650202710101810000820000"

    /**
     * 生成一个符合校验规则的随机身份证号码。
     *
     * 生成过程如下：
     * 1. 从预定义地址码池中随机选取 6 位行政区划代码。
     * 2. 随机生成 1950 年至 2005 年之间的出生日期，并按月份计算实际天数。
     * 3. 随机生成 3 位顺序码。
     * 4. 依据前 17 位数字与 GB 11643-1999 权重数组计算校验码。
     *
     * @summary 生成一个符合校验规则的随机身份证号码。
     *
     * @returns 生成的 18 位身份证号码字符串。
     * @since 26.7.1
     */
    override wantOne() {
      const addressCode = this.slice(ID.a, 6)

      const getRandomBirthday = () => {
        const year = Math.floor(Math.random() * 56) + 1950
        const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")
        let maxDay
        switch (month) {
          case "02":
            maxDay = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28
            break
          case "04":
          case "06":
          case "09":
          case "11":
            maxDay = 30
            break
          default:
            maxDay = 31
        }
        const day = String(Math.floor(Math.random() * maxDay) + 1).padStart(2, "0")
        return `${year}${month}${day}`
      }
      const birthdayCode = getRandomBirthday()

      const sequenceCode = String(Math.floor(Math.random() * 1000)).padStart(3, "0")

      const first17 = addressCode + birthdayCode + sequenceCode

      const getCheckCode = () => {
        const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
        let sum = 0
        for (let i = 0; i < 17; i++) {
          sum += parseInt(first17[i]) * weights[i]
        }
        const remainder = sum % 11
        return "10X98765432"[remainder]
      }
      const checkCode = getCheckCode()

      return first17 + checkCode
    }
  }

  /**
   * 中国大陆手机号码生成器。
   *
   * 该生成器从预定义的真实号段字符池中随机选取 3 位号段，并拼接 8 位随机
   * 后缀，生成符合中国大陆手机号码格式的模拟号码。
   *
   * @summary 中国大陆手机号码生成器。
   *
   * @since 26.7.1
   * @extends {Mock.RealityElement}
   *
   * @example
   * ```js
   * Mock.Tel.of().wantOne() // 例如 "13812345678"
   * ```
   */
  export class Tel extends RealityElement {
    private static s =
      "134135136137138139147148150151152157158159178182183184187188198195130131132145146155156166175176185186196133149153173177178180181189191199"

    /**
     * 生成一个符合中国大陆手机号格式的随机电话号码。
     *
     * @summary 生成一个符合中国大陆手机号格式的随机电话号码。
     *
     * @returns 生成的 11 位手机号码字符串。
     * @since 26.7.1
     */
    override wantOne() {
      const randomSegment = this.slice(Tel.s, 3)

      const randomSuffix = String(Math.floor(Math.random() * 100000000)).padStart(8, "0")

      return randomSegment + randomSuffix
    }
  }
}
